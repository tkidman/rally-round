const puppeteer = require("puppeteer");
const fs = require("fs");
const axios = require("axios");
const validCreds = {};
const debug = require("debug")("tkidman:rally-round:wrcAPI:getCreds");
const axiosInstance = axios.create({});
const racenetDomain = "https://web-api.racenet.com";

const getCreds = async () => {
  if (validCreds.accessToken) {
    return validCreds;
  }
  if (fs.existsSync("./tokens.json")) {
    const cachedCreds = JSON.parse(fs.readFileSync("./tokens.json"));
    debug("cached creds found, checking if valid");
    // validate the token
    try {
      const response = await axiosInstance({
        method: "GET",
        url: `${racenetDomain}/api/wrc2023clubs/67`,
        headers: { Authorization: `Bearer ${cachedCreds.accessToken}` }
      });
      if (response.status === 200) {
        debug("cached creds valid, using");
        validCreds.accessToken = cachedCreds.accessToken;
        return validCreds;
      }
    } catch (e) {
      debug(e.message);
    }
    debug("cached creds invalid, will regenerate");
  }
  const promise = new Promise((resolve, reject) => {
    login(resolve);
  });
  const creds = await promise;
  validCreds.accessToken = creds.accessToken;
  return validCreds;
};

const login = async resolve => {
  const username = process.env.RACENET_USERNAME;
  const password = process.env.RACENET_PASSWORD;

  // Launch Puppeteer and create a new page
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--user-agent=Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.0 Safari/537.36",
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--single-process"
    ]
  });
  const page = await browser.newPage();

  // Handle the "auth" response
  page.on("response", async response => {
    // debug(`response received ${response.url()}`);
    if (
      response
        .url()
        .includes("https://web-api.racenet.com/api/identity/auth") &&
      response.status() === 200
    ) {
      debug("200 auth response found");
      const responseBody = await response.text();

      // Parse the JSON response and extract tokens
      const authData = JSON.parse(responseBody);
      const accessToken = authData.access_token;
      //const tokenType = authData.token_type;
      //const expiresIn = authData.expires_in;
      const refreshToken = authData.refresh_token;
      //const idToken = authData.id_token;

      const tokens = {
        accessToken: accessToken,
        //tokenType: tokenType,
        //expiresIn: expiresIn,
        refreshToken: refreshToken
        //idToken: idToken
      };

      debug("writing tokens to tokens.json");
      fs.writeFileSync("tokens.json", JSON.stringify(tokens, null, 2));
      debug("returning tokens");
      resolve(tokens);
    }
  });

  try {
    // Navigate to the URL that requires authorization
    debug("navigating to ea");
    const url =
      "https://accounts.ea.com/connect/auth?client_id=RACENET_1_JS_WEB_APP&response_type=code&redirect_uri=https://racenet.com/oauthCallback";
    await page.goto(url);

    // Enters login information and click the "Sign in" button on the login page
    debug(`using creds ${username} ${password.slice(0, 2)}`);
    await page.type("#email", username);
    await page.type("#password", password);
    await page.click("#logInBtn");

    debug("credentials entered");
    // Wait for the login process to complete
    await page.waitForNavigation({ waitUntil: "networkidle2" });

    debug("nav complete");
    // Handle the cookie notice if it's present
    await page.waitForSelector("#truste-consent-button");
    const cookieButton = await page.$("#truste-consent-button");
    if (cookieButton) {
      debug("cookie button found, clicking");
      await cookieButton.click();
    }
  } catch (error) {
    debug("An error occurred:", error);
  } finally {
    //await browser.close();
  }
};

module.exports = { getCreds };
