// const https = require("https");

const axios = require("axios");
const debug = require("debug")("tkidman:rally-round:wrcAPI");
const fs = require("fs");
const { cachePath } = require("../../shared");
const { getCreds } = require("./getCreds");

const racenetDomain = "https://web-api.racenet.com";

const axiosInstance = axios.create({});

const retry = async (requestParams, attempts = 1) => {
  let error;
  for (let i = 0; i < attempts; i++) {
    try {
      const result = await axiosInstance(requestParams);
      return result;
    } catch (err) {
      error = err;
      debug(`error accessing racenet api, attempt ${i} : ${err.message}`);
    }
  }
  debug(error);
  throw error;
};

const fetchChampionshipIds = async clubId => {
  debug(`fetching championships ids for club ${clubId}`);
  const { accessToken } = await getCreds();
  const response = await retry({
    method: "GET",
    // https://web-api.racenet.com/api/wrc2023clubs/67?includeChampionship=true
    url: `${racenetDomain}/api/wrc2023clubs/${clubId}?includeChampionship=true`,
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  return response.data.championshipIDs;
};

const fetchChampionship = async championshipId => {
  debug(`fetching championship for id ${championshipId}`);
  const { accessToken } = await getCreds();
  const response = await retry({
    method: "GET",
    // https://web-api.racenet.com/api/wrc2023clubs/championships/5cES2pt12CVFjQcgA
    url: `${racenetDomain}/api/wrc2023clubs/championships/${championshipId}`,
    headers: { Authorization: `Bearer ${accessToken}` }
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

const fetchLeaderboard = async ({
  leaderboardId,
  clubId,
  cacheLeaderboard
}) => {
  debug(`fetching leaderboard for id: ${leaderboardId} club id ${clubId}`);
  const cacheFileName = `${cachePath}/${clubId}-${leaderboardId}.json`;
  const cacheFile = loadFromCache(cacheFileName);
  if (cacheFile) {
    debug(`cached event results retrieved: ${cacheFileName}`);
    return JSON.parse(cacheFile);
  }

  const { accessToken } = await getCreds();
  let firstCall = true;
  let next = null;
  let response;
  const allEntries = [];

  while (firstCall || next !== null) {
    firstCall = false;
    let url = `${racenetDomain}/api/wrc2023clubs/${clubId}/leaderboard/${leaderboardId}?SortCumulative=true&MaxResultCount=10&FocusOnMe=false&Platform=0`;
    if (next) {
      url = `${url}&Cursor=${next}`;
    }
    response = await retry({
      method: "GET",
      url,
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    next = response.data.next;
    allEntries.push(...response.data.entries);
  }

  response.data.entries = allEntries;

  if (cacheLeaderboard) {
    fs.writeFileSync(
      `${cacheFileName}`,
      JSON.stringify(response.data, null, 2)
    );
  }
  return response.data;
};

module.exports = {
  fetchChampionshipIds,
  fetchChampionship,
  fetchLeaderboard
};
