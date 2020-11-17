const { downloadCache } = require("./api/aws/s3");
const { orderResultsBy } = require("./shared");
const { orderEntriesBy } = require("./shared");
const debug = require("debug")("tkidman:dirt2-results");
const { eventStatuses } = require("./shared");
const { privateer } = require("./shared");
const { printMissingDrivers } = require("./state/league");
const { sortBy, keyBy } = require("lodash");
const { cachePath } = require("./shared");
const fs = require("fs");
const { createDNFResult } = require("./shared");
const { cloneDeep } = require("lodash");
const { recalculateDiffsForEntries } = require("./shared");

const { init, leagueRef } = require("./state/league");
const { writeOutput, checkOutputDirs } = require("./output/output");
const { getTotalPoints } = require("./shared");
const { calculateFantasyStandings } = require("./fantasy/fantasyCalculator");
const { fetchEvents } = require("./fetch");

const updatePoints = (resultsByDriver, orderedEntries, points, pointsField) => {
  for (let i = 0; i < points.length; i++) {
    if (orderedEntries.length > i) {
      const entry = orderedEntries[i];
      const driver = leagueRef.getDriver(entry.name);
      if (!entry.isDnfEntry || leagueRef.league.pointsForDNF) {
        resultsByDriver[driver.name][pointsField] = points[i];
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
        debug(
          `driver has null team id: ${driver.name} - ${driver.firstCarDriven}`
        );
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

const setDnfIfIncorrectCar = (event, entries, divisionName) => {
  // validate correct car usage
  entries.forEach(entry => {
    const driver = leagueRef.getDriver(entry.name);
    const division = leagueRef.league.divisions[divisionName];
    if (driver && driver.car && driver.car !== entry.vehicleName) {
      debug(
        `driver ${entry.name} used wrong car ${entry.vehicleName}, should have used ${driver.car}. Setting to dnf`
      );
      entry.isDnfEntry = true;
      entry.disqualificationReason = "Wrong car choice";
    }
    if (division.cars && !division.cars.includes(entry.vehicleName)) {
      debug(
        `driver ${entry.name} used wrong car ${entry.vehicleName}, should have used one of ${division.cars}. Setting to dnf`
      );
      entry.isDnfEntry = true;
      entry.disqualificationReason = "Wrong car choice";
    }
  });
};

const setManualResults = (
  event,
  entries,
  divisionName,
  firstStageResultsByDriver
) => {
  const defaultEntry = {
    isManualResult: true,
    isDnfEntry: false
  };
  const division = leagueRef.divisions[divisionName];
  const eventId = event.eventId;
  if (division.manualResults) {
    const eventManualResults = division.manualResults.find(
      eventManualResults => eventManualResults.eventId === eventId
    );
    if (eventManualResults) {
      eventManualResults.results.forEach(manualResult => {
        debug(`applying manual result for ${manualResult.name}`);
        const existingResult = entries.find(
          entry => entry.name === manualResult.name
        );
        if (existingResult) {
          Object.assign(existingResult, manualResult, defaultEntry);
        } else {
          const firstStageResult = firstStageResultsByDriver[manualResult.name];
          if (!firstStageResult) {
            debug(
              `unable to find first stage result for manual result for driver ${manualResult.name}`
            );
          } else {
            entries.push({
              ...firstStageResult.entry,
              ...manualResult,
              ...defaultEntry
            });
          }
        }
      });
    }
  }
};

const getResultsByDriver = entries => {
  const resultsByDriver = entries.reduce((resultsByDriver, entry) => {
    const driver = leagueRef.getDriver(entry.name);
    if (!driver) {
      debug(`unable to find driver in lookup for ${entry.name}`);
    }
    resultsByDriver[driver.name] = {
      name: driver.name,
      entry
    };
    return resultsByDriver;
  }, {});
  return resultsByDriver;
};

const addStageTimesToResultsByDriver = (
  resultsByDriver,
  racenetLeaderboardStages
) => {
  racenetLeaderboardStages.forEach(racenetLeaderboard => {
    racenetLeaderboard.entries.forEach(driverTime => {
      const driver = resultsByDriver[driverTime.name];
      if (!driver) return;
      if (!driver.stageTimes) driver.stageTimes = [];
      driver.stageTimes.push(driverTime.stageTime);
    });
  });
};

const getTotalPointsDisplay = (result, event) => {
  let display = result.totalPoints;
  if (
    !leagueRef.league.showLivePoints &&
    event.eventStatus === eventStatuses.active
  ) {
    display = "";
  }
  if (result.entry) {
    if (result.entry.disqualificationReason) {
      display = "DQ";
    } else if (result.entry.isDnsEntry) {
      if (event.eventStatus === eventStatuses.active) {
        // don't display DNS if event is still active
        display = "";
      } else {
        display = "DNS";
      }
    } else if (result.entry.isDnfEntry) {
      display = "DNF";
    }
  }
  return display;
};

const calculateEventResults = ({ event, divisionName, drivers }) => {
  const firstStageResultsByDriver = getResultsByDriver(
    event.racenetLeaderboardStages[0].entries,
    divisionName
  );

  // alert! mutations to the racenetLeaderboard entries occur here, and should only occur here
  const entries =
    event.racenetLeaderboardStages[event.racenetLeaderboardStages.length - 1]
      .entries;
  setManualResults(event, entries, divisionName, firstStageResultsByDriver);
  setDnfIfIncorrectCar(event, entries, divisionName);
  // TODO validate correct class
  const resultsByDriver = getResultsByDriver(entries, divisionName);

  // create results for drivers didn't finish the run
  Object.keys(drivers).forEach(driverName => {
    if (!resultsByDriver[driverName]) {
      if (
        !firstStageResultsByDriver[driverName] ||
        // treat unfinished runs as DNS while active
        event.eventStatus === eventStatuses.active
      ) {
        resultsByDriver[driverName] = createDNFResult(driverName, true);
      } else {
        resultsByDriver[driverName] = createDNFResult(driverName, false);
      }
    }
  });
  // end alert

  if (leagueRef.league.getAllResults)
    addStageTimesToResultsByDriver(
      resultsByDriver,
      event.racenetLeaderboardStages
    );

  // dnf entries are sorted below non-dnf entries
  const powerStageEntries = orderEntriesBy(entries, "stageTime");
  const totalEntries = orderEntriesBy(entries, "totalTime");
  const division = leagueRef.league.divisions[divisionName];
  if (
    event.eventStatus === eventStatuses.finished ||
    leagueRef.league.showLivePoints
  ) {
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
  }
  const driverResults = orderResultsBy(
    Object.values(resultsByDriver),
    "totalTime"
  );
  driverResults.forEach(result => {
    result.totalPoints = getTotalPoints(result);
    result.pointsDisplay = getTotalPointsDisplay(result, event);
  });

  const teamResults = [];
  if (leagueRef.hasTeams) {
    const teamResultsById = calculateTeamResults(
      driverResults,
      division.maxDriversScoringPointsForTeam
    );
    teamResults.push(...sortTeamResults(teamResultsById));
  }

  driverResults.forEach(result => (result.divisionName = divisionName));
  teamResults.forEach(result => {
    result.divisionName = divisionName;
    result.pointsDisplay = getTotalPointsDisplay(result, event);
  });
  return { driverResults, teamResults };
};

const calculateStandings = (results, previousStandings) => {
  const standings = results.map(result => {
    const standing = {
      name: result.name,
      totalPoints: result.totalPoints,
      previousPosition: null,
      divisionName: result.divisionName
    };
    if (previousStandings) {
      const previousStanding = previousStandings.find(
        standing => standing.name === result.name
      );
      if (previousStanding) {
        standing.previousPosition = previousStanding.currentPosition;
        standing.totalPoints =
          previousStanding.totalPoints + result.totalPoints;
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
    if (
      i !== 0 &&
      standing.totalPoints === sortedStandings[i - 1].totalPoints
    ) {
      standing.currentPosition = sortedStandings[i - 1].currentPosition;
    } else {
      standing.currentPosition = i + 1;
    }
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

const processEvent = ({ divisionName, event, previousEvent, drivers }) => {
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

const loadEventDriver = (entry, drivers) => {
  let driver = leagueRef.getDriver(entry.name);
  if (!driver) {
    debug(`adding unknown driver ${entry.name}`);
    driver = { name: entry.name };
    leagueRef.addDriver(driver);
    leagueRef.missingDrivers[entry.name] = driver;
  }
  driver.nationality = entry.nationality;
  if (!driver.firstCarDriven) {
    driver.firstCarDriven = entry.vehicleName;
  }
  drivers[driver.name] = driver;
};

const loadEventDrivers = (drivers, event) => {
  event.racenetLeaderboardStages[0].entries.forEach(entry => {
    loadEventDriver(entry, drivers);
  });
  event.racenetLeaderboardStages[
    event.racenetLeaderboardStages.length - 1
  ].entries.forEach(entry => {
    loadEventDriver(entry, drivers);
  });
  return drivers;
};

const loadDriversAcrossAllEvents = events => {
  const allDrivers = events.reduce((drivers, event) => {
    return loadEventDrivers(drivers, event);
  }, {});
  return allDrivers;
};

const processEvents = (events, divisionName) => {
  let previousEvent = null;
  const drivers = loadDriversAcrossAllEvents(events);
  for (const event of events) {
    debug(`processing ${divisionName} ${event.location}`);
    processEvent({ divisionName, event, previousEvent, drivers });
    previousEvent = event;
  }
};

const calculateOverall = processedDivisions => {
  const overall = {
    events: [],
    divisionName: "overall",
    divisionDisplayName: "Overall"
  };
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
        result =>
          Object.assign({ divisionName: divisionName }, cloneDeep(result))
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
      overallEvent.results.teamResults.forEach(result => {
        result.pointsDisplay = getTotalPointsDisplay(result, event);
      });
    });
  });

  overall.events.forEach((event, index) => {
    event.results.driverResults = orderResultsBy(
      event.results.driverResults,
      "totalTime"
    );
    const entries = event.results.driverResults.map(result => result.entry);
    recalculateDiffsForEntries(entries, "total");
    recalculateDiffsForEntries(entries, "stage");
    const previousEvent = index > 0 ? overall.events[index - 1] : null;
    calculateEventStandings(event, previousEvent);
  });
  return overall;
};

const calculateOverallResults = () => {
  leagueRef.league.overall = calculateOverall(leagueRef.league.divisions);
};

const loadCache = async () => {
  if (process.env.DIRT_AWS_ACCESS_KEY && leagueRef.league.websiteName) {
    const cacheFiles = await downloadCache(
      leagueRef.league.websiteName,
      leagueRef.league.subfolderName
    );
    cacheFiles.forEach(cacheFile => {
      const cacheFileName = cacheFile.key.slice(
        cacheFile.key.lastIndexOf("/") + 1
      );
      fs.writeFileSync(`${cachePath}/${cacheFileName}`, cacheFile.data.Body);
    });
  }
};

const processAllDivisions = async () => {
  try {
    checkOutputDirs();
    await init();
    const { league, divisions } = leagueRef;
    await loadCache();
    for (const divisionName of Object.keys(divisions)) {
      const division = divisions[divisionName];
      division.events = await fetchEvents(division, divisionName);
      processEvents(division.events, divisionName);
    }
    if (leagueRef.includeOverall) {
      calculateOverallResults();
    }
    await writeOutput(league);
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
