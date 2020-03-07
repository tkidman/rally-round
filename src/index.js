const axios = require("axios");
const debug = require("debug")("tkidman:dirt2-results");
const moment = require("moment");
const { keyBy, sortBy } = require("lodash");

const { cookie, xsrfh } = require("../hidden/creds");
const { teamsById, pointsConfig, driversById } = require("./referenceData");

const fetchChampionships = async () => {
  const response = await axios({
    method: "GET",
    url: "https://dirtrally2.com/api/Club/232735/championships",
    headers: { Cookie: cookie }
  });
  debug(response.data);
};

const fetchRecentResults = async () => {
  const response = await axios({
    method: "GET",
    url: "https://dirtrally2.com/api/Club/232735/recentResults",
    headers: { Cookie: cookie, "RaceNet.XSRFH": xsrfh }
  });
  debug(JSON.stringify(response.data, null, 2));
};

const fetchEventResults = async () => {
  const payload = {
    challengeId: "67014",
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
    eventId: "67465"
  };
  const response = await axios({
    method: "POST",
    url: "https://dirtrally2.com/api/Leaderboard",
    headers: { Cookie: cookie.trim(), "RaceNet.XSRFH": xsrfh.trim() },
    data: payload
  });
  debug.log(JSON.stringify(response.data, null, 2));
};

// fetchChampionships();
// fetchEventResults().catch(err => console.log(err));
// fetchRecentResults().catch(err => console.log(err));

const getDuration = durationString => {
  if (durationString.split(":").length === 2) {
    return moment.duration(`00:${durationString}`);
  }
  return moment.duration(durationString);
};

const orderResultsBy = (entries, field) => {
  return entries.slice().sort((a, b) => {
    return (
      getDuration(a[field]).asMilliseconds() -
      getDuration(b[field]).asMilliseconds()
    );
  });
};

const updatePoints = (resultsByDriver, orderedResults, points, pointsField) => {
  for (let i = 0; i < points.length; i++) {
    if (orderedResults.length > i) {
      const result = orderedResults[i];
      const driver = result.name;
      resultsByDriver[driver][pointsField] = points[i];
    }
  }
};

const calculateTeamResults = resultsByDriver => {
  const teamResults = Object.values(resultsByDriver).reduce(
    (teamResults, entry) => {
      const entryTeamId = driversById[entry.name].teamId;
      if (!teamResults[entryTeamId]) {
        teamResults[entryTeamId] = {
          teamId: entryTeamId,
          totalPoints: 0
        };
      }
      teamResults[entryTeamId].totalPoints +=
        entry.powerStagePoints + entry.overallPoints;
      return teamResults;
    },
    {}
  );
  return teamResults;
};

const sortTeamResults = teamResultsById => {
  const teamResults = sortBy(
    Object.values(teamResultsById),
    teamResult => teamResult.totalPoints
  );
  return teamResults.reverse();
};

const calculateEventResults = leaderboard => {
  const entries = leaderboard.entries;
  const resultsByDriver = keyBy(entries, entry => entry.name);
  const powerStageResults = orderResultsBy(entries, "stageTime");
  updatePoints(
    resultsByDriver,
    powerStageResults,
    pointsConfig.powerStage,
    "powerStagePoints"
  );
  updatePoints(resultsByDriver, entries, pointsConfig.overall, "overallPoints");
  const driverResults = orderResultsBy(
    Object.values(resultsByDriver),
    "totalTime"
  );
  const teamResultsById = calculateTeamResults(resultsByDriver);
  const teamResults = sortTeamResults(teamResultsById);
  return { driverResults, teamResults };
};

module.exports = {
  calculateEventResults,
  fetchChampionships,
  fetchEventResults,
  fetchRecentResults,
  sortTeamResults
};
