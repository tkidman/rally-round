const axios = require("axios");
const debug = require("debug")("tkidman:dirt2-results:dirtAPI");
const fs = require("fs");
const { cachePath } = require("../shared");
const USERNAME = process.env.DIRT_USERNAME;
const PASSWORD = process.env.DIRT_PASSWORD;
const USERNAME_SELECTOR = "#Email";
const PASSWORD_SELECTOR = "#Password";
const LOGIN_BUTTON_SELECTOR = "#login_button_container > input";
const puppeteer = require("puppeteer");

const { cookie, xsrfh } = require("../../creds");

const login = async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  page.on("console", msg => debug("PAGE LOG:", msg.text()));

  await page.goto("https://accounts.codemasters.com/");
  await page.waitForNavigation();

  await page.click(USERNAME_SELECTOR);
  await page.keyboard.type(USERNAME);

  await page.click(PASSWORD_SELECTOR);
  await page.keyboard.type(PASSWORD);

  await page.click(LOGIN_BUTTON_SELECTOR);

  // await page.goto(`https://dirtrally2.com/clubs/find-club/page/1`);
  const cookies = await page.cookies();
  const cookieHeader = cookies
    .map(cookie => `${cookie.name}=${cookie.value}`)
    .join("; ");
  debug(cookieHeader);
  page.on("request", request => {
    debug(request);
    if (request._url.includes("Search")) {
      debug(request._headers);
      return {
        Cookie: request._headers.Cookie,
        "RaceNet.XSRFH": request._headers["RaceNet.XSRFH"]
      };
    }
  });
};

const fetchChampionships = async clubId => {
  const response = await axios({
    method: "GET",
    url: `https://dirtrally2.com/api/Club/${clubId}/championships`,
    headers: { Cookie: cookie }
  });
  debug(response.data);
};

const fetchRecentResults = async clubId => {
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
  login
};
