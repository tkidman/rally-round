const debug = require("debug")("tkidman:dirt2-results");
const moment = require("moment");
const { keyBy, sortBy } = require("lodash");

const { league, getDriver } = require("./state/league");
const { fetchEventResults } = require("./dirtAPI");
const { writeJSON, writeCSV, checkOutputDirs } = require("./output");
const { getTotalPoints } = require("./shared");

const classes = league.classes;

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
      if (!result.isDnfEntry) {
        resultsByDriver[driver][pointsField] = points[i];
      }
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

const createDNSEntry = entry => {
  return {
    name: entry.name,
    isDnsEntry: true,
    stageTime: "15:00:00.000",
    totalTime: "59:59:59.000"
  };
};

const calculateEventResults = (leaderboard, previousEvent, className) => {
  const entries = leaderboard.entries;
  const resultsByDriver = keyBy(entries, entry => entry.name);

  // create results for drivers that didn't start a run
  if (previousEvent) {
    previousEvent.results.driverResults.forEach(entry => {
      if (!resultsByDriver[entry.name]) {
        resultsByDriver[entry.name] = createDNSEntry(entry);
      }
    });
  }

  const powerStageResults = orderResultsBy(entries, "stageTime");
  updatePoints(
    resultsByDriver,
    powerStageResults,
    classes[className].points.powerStage,
    "powerStagePoints"
  );
  updatePoints(
    resultsByDriver,
    entries,
    classes[className].points.overall,
    "overallPoints"
  );
  const driverResults = orderResultsBy(
    Object.values(resultsByDriver),
    "totalTime"
  );
  driverResults.forEach(entry => (entry.totalPoints = getTotalPoints(entry)));
  const teamResultsById = calculateTeamResults(resultsByDriver);
  const teamResults = sortTeamResults(teamResultsById);

  driverResults.forEach(result => (result.className = className));
  teamResults.forEach(result => (result.className = className));
  return { driverResults, teamResults };
};

const calculateStandings = (results, previousStandings) => {
  const standings = results.map(entry => {
    const standing = {
      name: entry.name,
      totalPoints: entry.totalPoints,
      previousPosition: null
    };
    if (previousStandings) {
      const previousIndex = previousStandings.findIndex(
        standing => standing.name === entry.name
      );
      if (previousIndex !== -1) {
        const previousStanding = previousStandings[previousIndex];
        standing.previousPosition = previousIndex + 1;
        standing.totalPoints = previousStanding.totalPoints + entry.totalPoints;
      }
    }
    return standing;
  });
  const sortedStandings = sortBy(
    standings,
    standing => 0 - standing.totalPoints
  );

  for (let i = 0; i < sortedStandings.length; i++) {
    const standing = sortedStandings[i];
    standing.currentPosition = i + 1;
    standing.positionChange = standing.previousPosition
      ? standing.previousPosition - standing.currentPosition
      : null;
  }
  return sortedStandings;
};

const calculateEventStandings = (event, previousEvent) => {
  const previousDriverStandings = previousEvent
    ? previousEvent.standings.driverStandings
    : null;
  const driverStandings = calculateStandings(
    event.results.driverResults,
    previousDriverStandings
  );

  const previousTeamStandings = previousEvent
    ? previousEvent.standings.teamStandings
    : null;
  const teamStandings = calculateStandings(
    event.results.teamResults,
    previousTeamStandings
  );
  event.standings = { driverStandings, teamStandings };
};

const processEvent = async (className, event, previousEvent) => {
  const leaderboard = await fetchEventResults({
    challengeId: event.challengeId,
    eventId: event.eventId,
    location: event.location,
    className
  });
  event.results = calculateEventResults(leaderboard, previousEvent, className);
  calculateEventStandings(event, previousEvent);
};

const processEvents = async (events, className) => {
  let previousEvent = null;
  for (const event of events) {
    debug(`processing ${className} ${event.location}`);
    await processEvent(className, event, previousEvent);
    previousEvent = event;
  }
};

const populateOverallResults = () => {
  const overall = [];
  Object.keys(classes).forEach(className => {
    const rallyClass = classes[className];
    rallyClass.events.forEach(event => {
      let overallEvent = overall.find(
        overallEvent => overallEvent.location === event.location
      );
      if (!overallEvent) {
        overallEvent = {
          location: event.location,
          results: { driverResults: [] }
        };
        overall.push(overallEvent);
      }
      const driverResultsWithClassName = event.results.driverResults.map(
        entry => Object.assign({ className }, { ...entry })
      );
      overallEvent.results.driverResults.push(...driverResultsWithClassName);
    });
  });
  overall.forEach(event => {
    event.results.driverResults = orderResultsBy(
      event.results.driverResults,
      "totalTime"
    );
  });
  league.overall = overall;
};

const processAllClasses = async () => {
  try {
    checkOutputDirs();
    for (const rallyClassName of Object.keys(classes)) {
      await processEvents(classes[rallyClassName].events, rallyClassName);
    }
    populateOverallResults();
    writeCSV(league);
    writeJSON(league);
  } catch (err) {
    debug(err);
    throw err;
  }
};

module.exports = {
  calculateEventResults,
  sortTeamResults,
  processEvent,
  calculateEventStandings,
  processAllClasses,
  populateOverallResults
};
