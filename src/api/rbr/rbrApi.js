const debug = require("debug")("tkidman:rally-round:api:rbr");
const axios = require("axios");
const { cachePath } = require("../../shared");
const fs = require("fs");
const { isNil, keyBy } = require("lodash");
const cheerio = require("cheerio");
const puppeteer = require("puppeteer");

const RSF_BASE_URL = "https://rallysimfans.hu/rbr";
const RSF_CREDS_FILE = "./rsf-creds.json";
const validCreds = {};

const loadFromCache = cacheFileName => {
  try {
    return fs.readFileSync(cacheFileName, "utf8");
  } catch (_err) {
    debug("cache file not found, loading from API");
  }
  return null;
};

const buildAxiosHeaders = sessionCookie => ({
  Cookie: `PHPSESSID=${sessionCookie}`,
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.0 Safari/537.36"
});

const isSessionValid = async sessionCookie => {
  try {
    const response = await axios.get(
      `${RSF_BASE_URL}/rally_online.php?centerbox=rally_results.php&rally_id=1`,
      { headers: buildAxiosHeaders(sessionCookie) }
    );
    return !response.data.includes("Please login");
  } catch (_err) {
    return false;
  }
};

const loginWithPuppeteer = async () => {
  const username = process.env.RSF_USERNAME;
  const password = process.env.RSF_PASSWORD;

  if (!username || !password) {
    throw new Error(
      "RSF_USERNAME and RSF_PASSWORD must be set in environment variables"
    );
  }

  debug("launching puppeteer for RSF login");
  const browser = await puppeteer.launch({
    headless: process.env.SHOW_BROWSER === "true" ? false : "new",
    args: [
      `--user-agent=Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.0 Safari/537.36`,
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--single-process",
      "--disable-gpu"
    ]
  });

  try {
    const page = await browser.newPage();
    debug("navigating to RSF login page");
    await page.goto(`${RSF_BASE_URL}/account2.php?centerbox=bejelentkezes2`, {
      waitUntil: "networkidle2"
    });

    const usernameSelector = 'input[name="l_username"]';
    const passwordSelector = 'input[name="l_pass"]';

    await page.waitForSelector(usernameSelector, { timeout: 10000 });
    await page.type(usernameSelector, username);
    await page.type(passwordSelector, password);

    debug("submitting RSF login form");
    const loginButton = await page.evaluateHandle(() => {
      const buttons = Array.from(
        document.querySelectorAll("button, input[type=submit]")
      );
      return buttons.find(
        el =>
          el.textContent.toLowerCase().includes("login") ||
          (el.value && el.value.toLowerCase().includes("login"))
      );
    });
    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle2" }),
      loginButton.click()
    ]);

    const cookies = await page.cookies();
    const phpSessId = cookies.find(c => c.name === "PHPSESSID");

    if (!phpSessId) {
      throw new Error("Login failed: PHPSESSID cookie not found after login");
    }

    debug("RSF login successful, session cookie obtained");
    return phpSessId.value;
  } finally {
    await browser.close();
  }
};

const getCreds = async () => {
  if (validCreds.sessionCookie) {
    return validCreds.sessionCookie;
  }

  if (fs.existsSync(RSF_CREDS_FILE)) {
    const cached = JSON.parse(fs.readFileSync(RSF_CREDS_FILE, "utf8"));
    if (cached.sessionCookie) {
      debug("cached RSF session found, validating");
      if (await isSessionValid(cached.sessionCookie)) {
        debug("cached RSF session is valid");
        validCreds.sessionCookie = cached.sessionCookie;
        return validCreds.sessionCookie;
      }
      debug("cached RSF session expired, re-logging in");
    }
  }

  const sessionCookie = await loginWithPuppeteer();
  fs.writeFileSync(RSF_CREDS_FILE, JSON.stringify({ sessionCookie }, null, 2));
  validCreds.sessionCookie = sessionCookie;
  return sessionCookie;
};

const fetchCsvResults = async (rallyId, eventFinished) => {
  const cacheFileName = `${cachePath}/${rallyId}.csv`;
  if (eventFinished) {
    const cacheFile = loadFromCache(cacheFileName);

    if (cacheFile) {
      debug(`cached event results retrieved: ${cacheFileName}`);
      return cacheFile;
    }
  }
  const sessionCookie = await getCreds();
  const response = await axios.get(
    `${RSF_BASE_URL}/csv_export_beta.php?rally_id=${rallyId}&ngp_enable=6`,
    { responseType: "blob", headers: buildAxiosHeaders(sessionCookie) }
  );

  if (eventFinished) {
    fs.writeFileSync(`${cacheFileName}`, response.data);
  }

  return response.data;
};

const fetchCsvStandings = async (rallyId, eventFinished) => {
  if (isNil(rallyId)) {
    throw new Error("invalid rally id, aborting");
  }
  const cacheFileName = `${cachePath}/${rallyId}_standings.csv`;
  if (eventFinished) {
    const cacheFile = loadFromCache(cacheFileName);

    if (cacheFile) {
      debug(`cached event results retrieved: ${cacheFileName}`);
      return cacheFile;
    }
  }

  const sessionCookie = await getCreds();
  const headers = buildAxiosHeaders(sessionCookie);
  const response = await axios.get(
    `${RSF_BASE_URL}/rally_online.php?centerbox=rally_results.php&rally_id=${rallyId}`,
    { headers }
  );
  const sess = extractSess(response.headers);
  const standingsCsvResponse = await axios.get(
    `${RSF_BASE_URL}/csv_export_results.php?rally_id=${rallyId}&group=7&ngp_enable=6&sess=${sess}`,
    { responseType: "blob", headers }
  );
  if (eventFinished) {
    fs.writeFileSync(`${cacheFileName}`, standingsCsvResponse.data);
  }

  return standingsCsvResponse.data;
};

const extractSess = responseHeaders => {
  const cookie = responseHeaders["set-cookie"][0];
  const sess = cookie.slice("PHPSESSID=".length);
  return sess.split(";")[0];
};

// we just need this for superrally really
const fetchHtmlSuperRally = async ({ rallyId, saveCacheFile }) => {
  const cacheFileName = `${cachePath}/${rallyId}_superrally.json`;
  if (runtimeCache[cacheFileName]) {
    return runtimeCache[cacheFileName];
  }
  if (saveCacheFile) {
    const cacheFile = loadFromCache(cacheFileName);

    if (cacheFile) {
      debug(`cached event results retrieved: ${cacheFileName}`);
      return JSON.parse(cacheFile);
    }
  }

  const sessionCookie = await getCreds();
  const data = [];
  const url = `${RSF_BASE_URL}/rally_online.php?centerbox=rally_results.php&rally_id=${rallyId}`;
  const response = await axios.get(url, {
    headers: buildAxiosHeaders(sessionCookie)
  });
  const html = response.data;
  const $ = cheerio.load(html);

  const finalStandingsTable = $("table.rally_results");

  // Check if the table was found
  if (finalStandingsTable.length > 0) {
    // Find the rows in the table
    const tableRows = finalStandingsTable.find("tr");

    // Loop through the rows, starting from the second row (index 1)
    tableRows.slice(1).each((index, row) => {
      const nameCell = $(row).find("td:eq(1)");

      // Extract and split data within the <samp> tags
      const nameData = nameCell
        .find("samp")
        .map((index, element) => $(element).text().trim().replace("/ ", ""))
        .get();
      const superRally = $(row).find(".rally_results_sr").text().trim();

      if (nameData.length > 0) {
        // Combine nameData elements into a single string with commas
        const name = nameData[0];
        data.push({
          name,
          superRally
        });
      }
    });
  }

  if (saveCacheFile) {
    fs.writeFileSync(`${cacheFileName}`, JSON.stringify(data, null, 2));
  }

  runtimeCache[cacheFileName] = data;
  return data;
};

const extractNationality = nameCell => {
  const nationalityImgSrc = nameCell.find("img").attr("src");
  const alpha2Code = nationalityImgSrc.slice(
    "images/flag/".length,
    "images/flag/".length + 2
  );
  return alpha2Code;
};
const extractStageNameCellData = (nameCell, $) => {
  const nameData = nameCell
    .find("samp")
    .map((index, element) => $(element).text().trim().replace("/ ", ""))
    .get();
  const driver = {
    name: nameData[0],
    vehicleName: nameData[2],
    nationality: extractNationality(nameCell)
  };
  return driver;
};

const extractStageTableData = ({ stageTable, eventFinished, $ }) => {
  const data = [];
  if (stageTable.length > 0) {
    // Find the rows in the table
    const tableRows = stageTable.find("tr");

    // Loop through the rows, starting from the second row (index 1)
    tableRows.slice(2).each((index, psRow) => {
      const nameCell = $(psRow).find(".stage_results_name");
      const driver = extractStageNameCellData(nameCell, $);
      const timeCell = $(psRow).find(".stage_results_time");
      const timeData = timeCell.find("b").text().trim();
      let diffFirst = $(psRow).find(".stage_results_diff_first").text().trim();

      if (!diffFirst.includes(":")) {
        diffFirst = `0:${diffFirst}`;
      }
      data.push({
        ...driver,
        // rsf hides times from us, so we have to use the diff as the time until the event ends
        stageTime: eventFinished ? timeData : diffFirst
      });
    });
  }
  return data;
};

const runtimeCache = {};

const fetchHtmlStageResults = async ({
  rallyId,
  eventFinished,
  saveCacheFile,
  stageNumber
}) => {
  const cacheFileName = `${cachePath}/${rallyId}_${stageNumber}_results.json`;

  if (runtimeCache[cacheFileName]) {
    return runtimeCache[cacheFileName];
  }

  if (saveCacheFile) {
    const cacheFile = loadFromCache(cacheFileName);

    if (cacheFile) {
      debug(`cached event results retrieved: ${cacheFileName}`);
      return JSON.parse(cacheFile);
    }
  }
  const sessionCookie = await getCreds();
  const url = `${RSF_BASE_URL}/rally_online.php?centerbox=rally_results_stres.php&rally_id=${rallyId}&stage_no=${stageNumber}`;
  const response = await axios.get(url, {
    headers: buildAxiosHeaders(sessionCookie)
  });
  const html = response.data;
  const $ = cheerio.load(html);

  const stageTableLeft = $("table.rally_results_stres_left");
  const stageResults = extractStageTableData({
    stageTable: stageTableLeft,
    eventFinished,
    $
  });

  const stageTableRight = $("table.rally_results_stres_right");
  const overallResults = extractStageTableData({
    stageTable: stageTableRight,
    eventFinished,
    $
  });

  // add the overall result to the stage result
  const resultsByName = keyBy(stageResults, "name");
  overallResults.forEach(overallResult => {
    resultsByName[overallResult.name].totalTime = overallResult.stageTime;
  });

  if (saveCacheFile) {
    fs.writeFileSync(`${cacheFileName}`, JSON.stringify(stageResults, null, 2));
  }

  runtimeCache[cacheFileName] = stageResults;
  return stageResults;
};

module.exports = {
  fetchCsvResults,
  fetchCsvStandings,
  fetchHtmlStageResults,
  fetchHtmlSuperRally,
  //testing
  extractSess,
  getCreds
};
