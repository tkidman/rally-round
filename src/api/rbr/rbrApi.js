const debug = require("debug")("tkidman:rally-round:api:rbr");
const axios = require("axios");
const { cachePath } = require("../../shared");
const fs = require("fs");
const { isNil, keyBy } = require("lodash");
const cheerio = require("cheerio");

const loadFromCache = cacheFileName => {
  try {
    return fs.readFileSync(cacheFileName, "utf8");
  } catch (_err) {
    debug("cache file not found, loading from API");
  }
  return null;
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
  const response = await axios.get(
    `https://rallysimfans.hu/rbr/csv_export_beta.php?rally_id=${rallyId}&ngp_enable=6`,
    { responseType: "blob" }
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

  const response = await axios.get(
    `https://rallysimfans.hu/rbr/rally_online.php?centerbox=rally_results.php&rally_id=${rallyId}`
  );
  const sess = extractSess(response.headers);
  const standingsCsvResponse = await axios.get(
    `https://rallysimfans.hu/rbr/csv_export_results.php?rally_id=${rallyId}&group=7&ngp_enable=6&sess=${sess}`,
    { responseType: "blob" }
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

  const data = [];
  const url = `https://rallysimfans.hu/rbr/rally_online.php?centerbox=rally_results.php&rally_id=${rallyId}`;
  const response = await axios.get(url);
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
  const url = `https://rallysimfans.hu/rbr/rally_online.php?centerbox=rally_results_stres.php&rally_id=${rallyId}&stage_no=${stageNumber}`;
  const response = await axios.get(url);
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
  extractSess
};
