const https = require("https");

const axios = require("axios");
const debug = require("debug")("tkidman:dirt2-results:dirtAPI");
const fs = require("fs");
const { cachePath } = require("../../shared");
const cachedCredsFile = "./cached-creds.json";

const USERNAME_SELECTOR = "#Email";
const PASSWORD_SELECTOR = "#Password";
const LOGIN_BUTTON_SELECTOR = "#login_button_container > input";
const puppeteer = require("puppeteer");
const { eventStatuses } = require("../../shared");
const validCreds = {};

const dirtRally2Domain = "https://dirtrally2.dirtgame.com";

// export the three certs in the chain from chrome as x509 certificate
const ca = fs.readFileSync("./src/api/dirt/GlobalSignRoot-CA.cer");
const g2 = fs.readFileSync("./src/api/dirt/G2.cer");
const cert = fs.readFileSync("./src/api/dirt/dirtgame.cer");
const httpsAgent = new https.Agent({
  ca: [ca, g2, cert]
});
const instance = axios.create({ httpsAgent });

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
  const browser = await puppeteer.launch({ headless: true });
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
  await page.goto(`${dirtRally2Domain}/clubs/find-club/page/1`);

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
  const response = await instance({
    method: "GET",
    url: `${dirtRally2Domain}/api/Club/MyClubs?page=1&pageSize=10`,
    headers: { Cookie: cookie, "RaceNet.XSRFH": xsrfh },
    httpsAgent
  });
  return response;
};

const fetchClubs = async () => {
  const { cookie, xsrfh } = await getCreds();
  const clubs = [];
  let pageNumber = 1;
  let numPages = null;

  while (!numPages || pageNumber <= numPages) {
    const payload = {
      searchTerm: "",
      pageNumber,
      pageSize: 100
    };

    const response = await instance({
      method: "POST",
      url: `${dirtRally2Domain}/api/Club/Search`,
      headers: { Cookie: cookie, "RaceNet.XSRFH": xsrfh },
      httpsAgent,
      data: payload
    });
    clubs.push(...response.data.clubs);
    numPages = response.data.pageCount;
    debug(`loaded clubs page ${pageNumber} of ${numPages}`);
    pageNumber++;
  }
  return clubs;
};

const fetchChampionships = async clubId => {
  const { cookie } = await getCreds();
  const response = await instance({
    method: "GET",
    url: `${dirtRally2Domain}/api/Club/${clubId}/championships`,
    headers: { Cookie: cookie }
  });
  return response.data;
};

const fetchRecentResults = async clubId => {
  const { cookie, xsrfh } = await getCreds();
  const response = await instance({
    method: "GET",
    url: `${dirtRally2Domain}/api/Club/${clubId}/recentResults`,
    headers: { Cookie: cookie, "RaceNet.XSRFH": xsrfh }
  });
  return response.data;
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
  divisionName,
  location,
  stageId,
  eventStatus
}) => {
  const { cookie, xsrfh } = await getCreds();
  const cacheFileName = `${cachePath}/${location}-${divisionName}-${eventId}-${stageId}.json`;
  const cacheFile = loadFromCache(cacheFileName);
  if (cacheFile) {
    debug(`cached event results retrieved: ${cacheFileName}`);
    return JSON.parse(cacheFile);
  }
  const payload = {
    eventId,
    challengeId,
    stageId,
    page: 1,
    pageSize: 100
    // selectedEventId: 0,
    // orderByTotalTime: true,
    // platformFilter: "None",
    // playerFilter: "Everyone",
    // filterByAssists: "Unspecified",
    // filterByWheel: "Unspecified",
    // nationalityFilter: "None",
  };
  try {
    const response = await instance({
      method: "POST",
      url: `${dirtRally2Domain}/api/Leaderboard`,
      headers: { Cookie: cookie.trim(), "RaceNet.XSRFH": xsrfh.trim() },
      data: payload
    });
    debug(`event results retrieved: ${eventId}`);
    // only cache finished events
    if (eventStatus !== eventStatuses.active) {
      fs.writeFileSync(
        `${cacheFileName}`,
        JSON.stringify(response.data, null, 2)
      );
    }
    return response.data;
  } catch (err) {
    debug(err);
    throw err;
  }
};

module.exports = {
  fetchChampionships,
  fetchRecentResults,
  fetchEventResults,
  fetchClubs,
  getCreds
};
