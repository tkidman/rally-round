const debug = require("debug")("tkidman:dirt2-results");
const moment = require("moment");
const { fetchRecentResults } = require("./dirtAPI");
const { sortBy } = require("lodash");

const { league, getDriver } = require("./state/league");
const { fetchEventResults } = require("./dirtAPI");
const { writeJSON, writeCSV, checkOutputDirs } = require("./output");
const { getTotalPoints } = require("./shared");
const { calculateFantasyStandings } = require("./fantasy/fantasy_calculator")
const { resultsToImage } = require("./visualisation/tableDrawer")

const classes = league.classes;
const dnfFactor = 100000000;

const getDuration = durationString => {
  if (durationString.split(":").length === 2) {
    return moment.duration(`00:${durationString}`);
  }
  return moment.duration(durationString);
};

const getSortNumber = (entry, field) => {
  const durationInMillis = getDuration(entry[field]).asMilliseconds();
  if (entry.isDnfEntry) {
    return durationInMillis + dnfFactor;
  }
  return durationInMillis;
};

const getSortComparison = (entryA, entryB, field) => {
  return getSortNumber(entryA, field) - getSortNumber(entryB, field);
};

const orderEntriesBy = (entries, field) => {
  return entries.slice().sort((a, b) => {
    return getSortComparison(a, b, field);
  });
};

const orderResultsBy = (results, field) => {
  return results.slice().sort((a, b) => {
    return getSortComparison(a.entry, b.entry, field);
  });
};

const updatePoints = (resultsByDriver, orderedEntries, points, pointsField) => {
  for (let i = 0; i < points.length; i++) {
    if (orderedEntries.length > i) {
      const entry = orderedEntries[i];
      const driver = entry.name;
      if (!entry.isDnfEntry || league.pointsForDNF) {
        resultsByDriver[driver][pointsField] = points[i];
      }
    }
  }
};

const calculateTeamResults = resultsByDriver => {
  const teamResults = Object.values(resultsByDriver).reduce(
    (teamResults, result) => {
      const driver = getDriver(result.name);
      if (driver) {
        const resultTeamId = driver.teamId;
        if (resultTeamId) {
          if (!teamResults[resultTeamId]) {
            teamResults[resultTeamId] = {
              name: resultTeamId,
              totalPoints: 0
            };
          }
          if (result.overallPoints) {
            teamResults[resultTeamId].totalPoints += result.overallPoints;
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
    entry: {
      isDnfEntry: true,
      isDnsEntry: true,
      stageTime: "15:00:00.000",
      totalTime: "59:59:59.000"
    }
  };
};

const calculateEventResults = (leaderboard, previousEvent, className) => {
  const entries = leaderboard.entries;
  const resultsByDriver = entries.reduce((resultsByDriver, entry) => {
    resultsByDriver[entry.name] = {
      name: entry.name,
      entry
    };
    return resultsByDriver;
  }, {});

  // create results for drivers that didn't start a run
  if (previousEvent) {
    previousEvent.results.driverResults.forEach(entry => {
      if (!resultsByDriver[entry.name]) {
        resultsByDriver[entry.name] = createDNSEntry(entry);
      }
    });
  }

  const powerStageEntries = orderEntriesBy(entries, "stageTime");
  const totalEntries = orderEntriesBy(entries, "totalTime");
  updatePoints(
    resultsByDriver,
    powerStageEntries,
    classes[className].points.powerStage,
    "powerStagePoints"
  );
  updatePoints(
    resultsByDriver,
    totalEntries,
    classes[className].points.overall,
    "overallPoints"
  );
  const driverResults = orderResultsBy(
    Object.values(resultsByDriver),
    "totalTime"
  );
  driverResults.forEach(
    result => (result.totalPoints = getTotalPoints(result))
  );
  const teamResultsById = calculateTeamResults(resultsByDriver);
  const teamResults = sortTeamResults(teamResultsById);

  calculateFantasyStandings(resultsByDriver, previousEvent);
  resultsToImage(resultsByDriver);

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
  const leaderboard = await fetchEventResults(event);
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

const calculateOverall = processedClasses => {
  const overall = [];
  Object.keys(processedClasses).forEach(className => {
    const rallyClass = processedClasses[className];
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
  return overall;
};

const calculateOverallResults = () => {
  league.overall = calculateOverall(classes);
};

const fetchEventKeys = async (rallyClass, rallyClassName) => {
  const recentResults = await fetchRecentResults(rallyClass.clubId);
  return getEventKeysFromRecentResults(
    recentResults,
    rallyClass,
    rallyClassName
  );
};

const getEventKeysFromRecentResults = (
  recentResults,
  rallyClass,
  rallyClassName
) => {
  // pull out championships matching championship ids
  const championships = recentResults.championships.filter(championship =>
    rallyClass.championshipIds.includes(championship.id)
  );
  const eventKeys = championships.reduce((events, championship) => {
    const eventResultKeys = championship.events.map(event => {
      return {
        eventId: event.id,
        challengeId: event.challengeId,
        stageId: `${event.stages.length - 1}`,
        location: event.name,
        className: rallyClassName
      };
    });
    events.push(...eventResultKeys);
    return events;
  }, []);
  return eventKeys;
};

const processAllClasses = async () => {
  try {
    checkOutputDirs();
    for (const rallyClassName of Object.keys(classes)) {
      const rallyClass = classes[rallyClassName];
      rallyClass.events = await fetchEventKeys(rallyClass, rallyClassName);
      await processEvents(rallyClass.events, rallyClassName);
    }
    calculateOverallResults();
    writeCSV(league);
    writeJSON(league);
  } catch (err) {
    debug(err);
    throw err;
  }
};

module.exports = {
  processAllClasses,
  // for tests
  calculateEventResults,
  sortTeamResults,
  processEvent,
  calculateEventStandings,
  calculateOverall,
  getEventKeysFromRecentResults
};
