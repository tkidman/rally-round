const axios = require("axios");
const debug = require("debug")("tkidman:dirt2-results:dirtAPI");
const fs = require("fs");
const cacheDir = "./hidden/cache";

const { cookie, xsrfh } = require("../../creds");

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
  const cacheFileName = `${cacheDir}/${location}-${className}-${challengeId}.json`;
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

module.exports = { fetchChampionships, fetchRecentResults, fetchEventResults };
