const debug = require("debug")("tkidman:dirt2-results");
const moment = require("moment");
const { keyBy, sortBy } = require("lodash");

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
              name: entryTeamId,
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
  driverResults.forEach(entry => (entry.totalPoints = getTotalPoints(entry)));
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

const calculateStandings = (results, previousStandings) => {
  const standings = results.map(entry => {
    const previousIndex = previousStandings.findIndex(
      standing => standing.name === entry.name
    );
    const previousStanding = previousStandings[previousIndex];
    const standing = {
      name: entry.name,
      previousPosition: previousIndex + 1,
      points: previousStanding.points + entry.totalPoints
    };
    return standing;
  });
  const sortedStandings = sortBy(standings, standing => 0 - standing.points);

  for (let i = 0; i < sortedStandings.length; i++) {
    const standing = sortedStandings[i];
    standing.currentPosition = i + 1;
    standing.positionChange =
      standing.currentPosition - standing.previousPosition;
  }
};

const calculateEventStandings = (event, previousEvent) => {
  const driverStandings = calculateStandings(
    event.results.driverResults,
    previousEvent.standings.driverStandings
  );
  const teamStandings = calculateStandings(
    event.results.teamResults,
    previousEvent.standings.teamStandings
  );
  event.standings = { driverStandings, teamStandings };
};

const processEvent = async (event, previousEvent) => {
  const leaderboard = await fetchEventResults({
    challengeId: event.challengeId,
    eventId: event.eventId
  });
  event.results = calculateEventResults(leaderboard);
  calculateStandings(event, previousEvent);
};

const processEvents = async events => {
  let previousEvent = null;
  for (const event of events) {
    await processEvent(event, previousEvent);
    previousEvent = event;
  }
};

module.exports = {
  calculateEventResults,
  sortTeamResults,
  processEvent,
  calculateEventStandings
};
