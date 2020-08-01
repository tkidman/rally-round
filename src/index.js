const debug = require("debug")("tkidman:dirt2-results");
const moment = require("moment");
const { privateer } = require("./shared");
const { printMissingDrivers } = require("./state/league");
const { sortBy, keyBy } = require("lodash");

const { init, leagueRef } = require("./state/league");
const { writeOutput, checkOutputDirs } = require("./output");
const { getTotalPoints } = require("./shared");
const { calculateFantasyStandings } = require("./fantasy/fantasyCalculator");
const {
  fantasyStandingsToImage,
  drawResults
} = require("./visualisation/tableDrawer");
const { fetchEvents } = require("./fetch");

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
      if (!entry.isDnfEntry || leagueRef.league.pointsForDNF) {
        resultsByDriver[driver][pointsField] = points[i];
      }
    }
  }
};

const calculateTeamResults = (
  driverResults,
  maxDriversScoringPointsForTeam
) => {
  const teamResults = driverResults.reduce((teamResults, result) => {
    const driver = leagueRef.getDriver(result.name);
    if (driver) {
      const resultTeamId = driver.teamId;
      result.teamId = resultTeamId;
      if (resultTeamId && resultTeamId !== privateer) {
        if (!teamResults[resultTeamId]) {
          teamResults[resultTeamId] = {
            name: resultTeamId,
            totalPoints: 0,
            driverResultsCounted: 0
          };
        }
        if (result.overallPoints) {
          const maxDriversReached =
            maxDriversScoringPointsForTeam &&
            teamResults[resultTeamId].driverResultsCounted >=
              maxDriversScoringPointsForTeam;
          if (!maxDriversReached) {
            teamResults[resultTeamId].totalPoints += result.overallPoints;
            teamResults[resultTeamId].driverResultsCounted++;
          } else {
            debug(
              `max drivers reached for team ${resultTeamId}, result ignored for ${result.name} `
            );
          }
        }
      } else if (!resultTeamId) {
        debug(`driver has null team id: ${driver.id}`);
      }
    }
    return teamResults;
  }, {});
  return teamResults;
};

const sortTeamResults = teamResultsById => {
  const teamResults = sortBy(
    Object.values(teamResultsById),
    teamResult => teamResult.totalPoints
  );
  return teamResults.reverse();
};

const createDNSResult = driverName => {
  return {
    name: driverName,
    entry: {
      name: driverName,
      isDnfEntry: true,
      isDnsEntry: true,
      stageTime: "15:00:00.000",
      totalTime: "59:59:59.000"
    }
  };
};

const setDnfIfIncorrectCar = entry => {
  // validate correct car usage
  const driver = leagueRef.getDriver(entry.name);
  if (driver && driver.car && driver.car !== entry.vehicleName) {
    debug(
      `driver ${entry.name} used wrong car ${entry.vehicleName}, should have used ${driver.car}. Setting to dnf`
    );
    entry.isDnfEntry = true;
    entry.disqualificationReason = "Wrong car choice";
  }
};

const calculateEventResults = ({ event, divisionName, drivers }) => {
  const entries = event.racenetLeaderboard.entries;
  const resultsByDriver = entries.reduce((resultsByDriver, entry) => {
    resultsByDriver[entry.name] = {
      name: entry.name,
      entry
    };
    setDnfIfIncorrectCar(entry);
    // TODO validate correct class
    return resultsByDriver;
  }, {});

  // create results for drivers that didn't start a run
  Object.keys(drivers).forEach(driver => {
    if (!resultsByDriver[driver]) {
      resultsByDriver[driver] = createDNSResult(driver);
    }
  });

  // dnf entries are sorted below non-dnf entries
  const powerStageEntries = orderEntriesBy(entries, "stageTime");
  const totalEntries = orderEntriesBy(entries, "totalTime");
  const division = leagueRef.league.divisions[divisionName];
  updatePoints(
    resultsByDriver,
    powerStageEntries,
    division.points.powerStage,
    "powerStagePoints"
  );
  updatePoints(
    resultsByDriver,
    totalEntries,
    division.points.overall,
    "overallPoints"
  );
  const driverResults = orderResultsBy(
    Object.values(resultsByDriver),
    "totalTime"
  );
  driverResults.forEach(
    result => (result.totalPoints = getTotalPoints(result))
  );
  const teamResultsById = calculateTeamResults(
    driverResults,
    division.maxDriversScoringPointsForTeam
  );
  const teamResults = sortTeamResults(teamResultsById);

  driverResults.forEach(result => (result.divisionName = divisionName));
  teamResults.forEach(result => (result.divisionName = divisionName));
  return { driverResults, teamResults };
};

const calculateStandings = (results, previousStandings, location) => {
  const standings = results.map(result => {
    const standing = {
      currentStanding: {
        name: result.name,
        totalPoints: result.totalPoints,
        previousPosition: null,
        location,
        result
      },
      allStandings: []
    };
    if (previousStandings) {
      const previousIndex = previousStandings.findIndex(
        standing => standing.currentStanding.name === result.name
      );
      if (previousIndex !== -1) {
        const previousStanding = previousStandings[previousIndex];
        standing.currentStanding.previousPosition = previousIndex + 1;
        standing.currentStanding.totalPoints =
          previousStanding.currentStanding.totalPoints + result.totalPoints;
        standing.allStandings.push(...previousStanding.allStandings);
      }
    }
    standing.allStandings.push(standing.currentStanding);
    return standing;
  });
  const sortedStandings = sortBy(
    standings,
    standing => 0 - standing.currentStanding.totalPoints
  );

  for (let i = 0; i < sortedStandings.length; i++) {
    const standing = sortedStandings[i];
    standing.currentStanding.currentPosition = i + 1;
    standing.currentStanding.positionChange = standing.currentStanding
      .previousPosition
      ? standing.currentStanding.previousPosition -
        standing.currentStanding.currentPosition
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
    previousDriverStandings,
    event.location
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

const processEvent = async ({
  divisionName,
  event,
  previousEvent,
  drivers
}) => {
  event.results = calculateEventResults({
    event,
    divisionName,
    drivers
  });
  calculateEventStandings(event, previousEvent);
  if (leagueRef.league.divisions[divisionName].fantasy) {
    calculateFantasyStandings(
      event,
      previousEvent,
      leagueRef.league,
      divisionName
    );
  }
};

const processEvents = async (events, divisionName) => {
  let previousEvent = null;
  const drivers = events.reduce((drivers, event) => {
    event.racenetLeaderboard.entries.forEach(entry => {
      const driver = leagueRef.getDriver(entry.name);
      driver.nationality = entry.nationality;
      drivers[entry.name] = driver;
    });
    return drivers;
  }, {});
  for (const event of events) {
    debug(`processing ${divisionName} ${event.location}`);
    await processEvent({ divisionName, event, previousEvent, drivers });
    previousEvent = event;
  }
};

const calculateOverall = processedDivisions => {
  const overall = { events: [] };
  Object.keys(processedDivisions).forEach(divisionName => {
    const division = processedDivisions[divisionName];
    division.events.forEach(event => {
      let overallEvent = overall.events.find(
        overallEvent => overallEvent.location === event.location
      );
      if (!overallEvent) {
        overallEvent = {
          location: event.location,
          results: { driverResults: [], teamResults: [] }
        };
        overall.events.push(overallEvent);
      }
      const driverResultsWithDivisionName = event.results.driverResults.map(
        entry => Object.assign({ divisionName: divisionName }, { ...entry })
      );
      overallEvent.results.driverResults.push(...driverResultsWithDivisionName);

      // team results
      const overallTeamResultsByName = keyBy(
        overallEvent.results.teamResults,
        "name"
      );
      event.results.teamResults.forEach(teamResult => {
        if (!overallTeamResultsByName[teamResult.name]) {
          overallTeamResultsByName[teamResult.name] = {
            ...teamResult,
            divisionName: "overall"
          };
        } else {
          overallTeamResultsByName[teamResult.name].totalPoints +=
            teamResult.totalPoints;
        }
      });
      overallEvent.results.teamResults = sortTeamResults(
        overallTeamResultsByName
      );
    });
  });

  overall.events.forEach((event, index) => {
    event.results.driverResults = orderResultsBy(
      event.results.driverResults,
      "totalTime"
    );
    const previousEvent = index > 0 ? overall.events[index - 1] : null;
    calculateEventStandings(event, previousEvent);
  });
  return overall;
};

const calculateOverallResults = () => {
  leagueRef.league.overall = calculateOverall(leagueRef.league.divisions);
};

const processAllDivisions = async () => {
  try {
    checkOutputDirs();
    await init();
    const { league, divisions } = leagueRef;
    for (const divisionName of Object.keys(divisions)) {
      const division = divisions[divisionName];
      division.events = await fetchEvents(division, divisionName);
      await processEvents(division.events, divisionName);
    }
    calculateOverallResults();
    if (league.fantasy) fantasyStandingsToImage(league.fantasy);
    drawResults(league);
    writeOutput(league);
    printMissingDrivers();
  } catch (err) {
    debug(err);
    throw err;
  }
};

module.exports = {
  processAllDivisions,
  // for tests
  calculateEventResults,
  sortTeamResults,
  processEvent,
  calculateEventStandings,
  calculateOverall
};
