const axios = require("axios");
const debug = require("debug")("tkidman:dirt2-results:dirtAPI");
const fs = require("fs");
const { cachePath } = require("../shared");
const cachedCredsFile = "./cached-creds.json";

const USERNAME_SELECTOR = "#Email";
const PASSWORD_SELECTOR = "#Password";
const LOGIN_BUTTON_SELECTOR = "#login_button_container > input";
const puppeteer = require("puppeteer");
const validCreds = {};

const getCreds = async () => {
  if (validCreds.cookie) {
    return validCreds;
  }
  const promise = new Promise((resolve, reject) => {
    login(resolve);
  });
  const creds = await promise;
  validCreds.cookie = creds.cookie;
  validCreds.xsrfh = creds.xsrfh;
  return validCreds;
};

const login = async resolve => {
  const username = process.env.DIRT_USERNAME;
  const password = process.env.DIRT_PASSWORD;

  if (fs.existsSync(cachedCredsFile)) {
    const cachedCreds = JSON.parse(fs.readFileSync(cachedCredsFile, "utf8"));

    try {
      const response = await myClubs(cachedCreds);
      if (response.status === 200) {
        debug("using cached credentials");
        resolve(cachedCreds);
        return;
      }
      debug("cached credentials are invalid, regenerating");
    } catch (err) {
      debug("cached credentials are invalid, regenerating");
    }
  }
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  // page.on("console", msg => debug("PAGE LOG:", msg.text()));

  debug("going to https://accounts.codemasters.com");
  await page.goto("https://accounts.codemasters.com/");
  await page.waitForNavigation();

  await page.click(USERNAME_SELECTOR);
  await page.keyboard.type(username);

  await page.click(PASSWORD_SELECTOR);
  await page.keyboard.type(password);

  debug("logging in ...");
  await page.click(LOGIN_BUTTON_SELECTOR);
  debug("going to find-clubs page ...");
  await page.goto(`https://dirtrally2.com/clubs/find-club/page/1`);

  debug("extracting credentials ...");

  page.on("request", async request => {
    if (request._url.includes("Search")) {
      const cookies = await page.cookies();
      const cookieHeader = cookies
        .map(cookie => `${cookie.name}=${cookie.value}`)
        .join("; ");
      const creds = {
        cookie: cookieHeader,
        xsrfh: request._headers["racenet.xsrfh"]
      };
      fs.writeFileSync(cachedCredsFile, JSON.stringify(creds, null, 2));
      debug("credentials retrieved, closing headless browser");
      await page.close();
      await browser.close();
      resolve(creds);
    }
  });
};

const myClubs = async creds => {
  const { cookie, xsrfh } = creds;
  const response = await axios({
    method: "GET",
    url: `https://dirtrally2.com/api/Club/MyClubs?page=1&pageSize=10`,
    headers: { Cookie: cookie, "RaceNet.XSRFH": xsrfh }
  });
  return response;
};

const fetchChampionships = async clubId => {
  const { cookie } = await getCreds();
  const response = await axios({
    method: "GET",
    url: `https://dirtrally2.com/api/Club/${clubId}/championships`,
    headers: { Cookie: cookie }
  });
  debug(response.data);
};

const fetchRecentResults = async clubId => {
  const { cookie, xsrfh } = await getCreds();
  const response = await axios({
    method: "GET",
    url: `https://dirtrally2.com/api/Club/${clubId}/recentResults`,
    headers: { Cookie: cookie, "RaceNet.XSRFH": xsrfh }
  });
  debug(JSON.stringify(response.data, null, 2));
};

const loadFromCache = cacheFileName => {
  try {
    return fs.readFileSync(cacheFileName, "utf8");
  } catch (err) {
    debug("cache file not found, loading from API");
  }
  return null;
};

const fetchEventResults = async ({
  eventId,
  challengeId,
  className,
  location
}) => {
  const { cookie, xsrfh } = await getCreds();
  const cacheFileName = `${cachePath}/${location}-${className}-${challengeId}.json`;
  const cacheFile = loadFromCache(cacheFileName);
  if (cacheFile) {
    debug(`cached event results retrieved: ${cacheFileName}`);
    return JSON.parse(cacheFile);
  }
  const payload = {
    challengeId,
    selectedEventId: 0,
    stageId: "11",
    page: 1,
    pageSize: 100,
    orderByTotalTime: true,
    platformFilter: "None",
    playerFilter: "Everyone",
    filterByAssists: "Unspecified",
    filterByWheel: "Unspecified",
    nationalityFilter: "None",
    eventId
  };
  const response = await axios({
    method: "POST",
    url: "https://dirtrally2.com/api/Leaderboard",
    headers: { Cookie: cookie.trim(), "RaceNet.XSRFH": xsrfh.trim() },
    data: payload
  });
  debug(`event results retrieved: ${eventId}`);
  fs.writeFileSync(`${cacheFileName}`, JSON.stringify(response.data, null, 2));
  return response.data;
};

module.exports = {
  fetchChampionships,
  fetchRecentResults,
  fetchEventResults,
  getCreds
};
