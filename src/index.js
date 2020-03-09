const debug = require("debug")("tkidman:dirt2-results");
const moment = require("moment");
const { keyBy, sortBy } = require("lodash");
const fs = require("fs");
const Papa = require("papaparse");

const { teamsById, pointsConfig, driversById } = require("./referenceData");
const { fetchEventResults } = require("./dirtAPI");

const getDriver = name => {
  const driver = driversById[name.toUpperCase()];
  if (!driver) {
    debug(`unable to find driver for driver name: ${name}`);
  }
  return driver;
};
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
      const driver = getDriver(entry.name);
      if (driver) {
        const entryTeamId = driver.teamId;
        if (entryTeamId) {
          if (!teamResults[entryTeamId]) {
            teamResults[entryTeamId] = {
              teamId: entryTeamId,
              totalPoints: 0
            };
          }
          if (entry.overallPoints) {
            teamResults[entryTeamId].totalPoints += entry.overallPoints;
          }
        } else {
          debug(`driver has null team id: ${driver.id}`);
        }
      }
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

const getTotalPoints = entry => {
  let totalPoints = 0;
  totalPoints += entry.powerStagePoints ? entry.powerStagePoints : 0;
  totalPoints += entry.overallPoints ? entry.overallPoints : 0;
  return totalPoints;
};
const processEvent = async () => {
  const leaderboard = await fetchEventResults({
    challengeId: "67014",
    eventId: "67465"
  });
  const eventResults = calculateEventResults(leaderboard);
  fs.writeFileSync(
    "../hidden/out/eventResults.json",
    JSON.stringify(eventResults, null, 2)
  );
  const driverRows = eventResults.driverResults.map(result => {
    const driver = getDriver(result.name);
    const driverRow = {};
    driverRow["POS."] = result.rank;
    driverRow.TEAM_IMG = driver ? driver.teamImg : "";
    driverRow.COUNTRY_IMG = driver ? driver.countryImg : "";
    driverRow.CLASS = "TODO";
    driverRow.DRIVER = result.name;
    driverRow.VEHICLE = result.vehicleName;
    driverRow.TOTAL = result.totalTime;
    driverRow.DIFF = result.totalDiff;
    driverRow.POWER_STAGE_POINTS = result.powerStagePoints;
    driverRow.OVERALL_POINTS = result.overallPoints;
    driverRow.TOTAL_POINTS = getTotalPoints(result);
    return driverRow;
  });
  const driversCSV = Papa.unparse(driverRows);
  fs.writeFileSync("../hidden/out/driverResults.csv", driversCSV);
  return eventResults;
};

module.exports = {
  calculateEventResults,
  sortTeamResults,
  processEvent
};
