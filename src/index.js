const debug = require("debug")("tkidman:dirt2-results");
const moment = require("moment");
const { keyBy, sortBy } = require("lodash");

const { teamsById, pointsConfig, driversById } = require("./referenceData");

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
  debug("calculating event results");
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
  sortTeamResults
};
