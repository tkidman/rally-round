const debug = require("debug")("tkidman:dirt2-results:api:rbr");
const axios = require("axios");
const { cachePath } = require("../../shared");
const fs = require("fs");

const loadFromCache = cacheFileName => {
  try {
    return fs.readFileSync(cacheFileName, "utf8");
  } catch (err) {
    debug("cache file not found, loading from API");
  }
  return null;
};

const fetchResults = async (rallyId, eventFinished) => {
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

const fetchStandings = async (rallyId, eventFinished) => {
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

module.exports = {
  fetchResults,
  fetchStandings,
  //testing
  extractSess
};
