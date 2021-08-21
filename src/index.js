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
const { cloneDeep, last, get } = require("lodash");
const { recalculateDiffsForEntries } = require("./shared");
const vehicles = require("./state/constants/vehicles.json");
const { resultTypes } = require("./shared");
const { map } = require("lodash");
const { sumBy } = require("lodash");
const { recalculateDiffs } = require("./shared");

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
        let newPoints = points[i];
        if (resultsByDriver[driver.name][pointsField]) {
          newPoints += resultsByDriver[driver.name][pointsField];
        }
        resultsByDriver[driver.name][pointsField] = newPoints;
      }
    }
  }
};

const calculateTeamResults = (
  driverResults,
  maxDriversScoringPointsForTeam,
  eventIndex
) => {
  const pointsField = leagueRef.league.teamPointsForPowerstage
    ? "totalPoints"
    : "overallPoints";
  const sortedDriverResults = [...driverResults].sort(
    (a, b) => b[pointsField] - a[pointsField]
  );
  const teamResults = sortedDriverResults.reduce((teamResults, result) => {
    const driver = leagueRef.getDriver(result.name);
    if (driver) {
      const resultTeamId = getResultTeamId(eventIndex, driver);
      result.teamId = resultTeamId;
      if (resultTeamId && resultTeamId !== privateer) {
        if (!teamResults[resultTeamId]) {
          teamResults[resultTeamId] = {
            name: resultTeamId,
            totalPoints: 0,
            driverResultsCounted: 0
          };
        }
        if (result[pointsField]) {
          const maxDriversReached =
            maxDriversScoringPointsForTeam &&
            teamResults[resultTeamId].driverResultsCounted >=
              maxDriversScoringPointsForTeam;
          if (!maxDriversReached) {
            teamResults[resultTeamId].totalPoints += result[pointsField];
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
    if (
      !division.disableSameCarValidation &&
      driver &&
      driver.car &&
      driver.car !== entry.vehicleName
    ) {
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

const setManualResults = ({
  eventIndex,
  entries,
  divisionName,
  firstStageResultsByDriver
}) => {
  const defaultEntry = {
    isManualResult: true,
    isDnfEntry: false
  };
  const division = leagueRef.divisions[divisionName];
  if (division.manualResults) {
    const eventManualResults = division.manualResults.find(
      eventManualResults => eventManualResults.eventIndex === eventIndex
    );
    if (eventManualResults) {
      eventManualResults.results.forEach(manualEntry => {
        debug(`applying manual result for ${manualEntry.name}`);
        const driverNames = leagueRef.getDriverNames(manualEntry.name);
        const existingEntry = entries.find(entry =>
          driverNames.includes(entry.name)
        );
        if (existingEntry) {
          Object.assign(existingEntry, defaultEntry, manualEntry, {
            name: existingEntry.name
          });
        } else {
          const firstStageResult = firstStageResultsByDriver[manualEntry.name];
          if (!firstStageResult) {
            debug(
              `unable to find first stage result for manual result for driver ${manualEntry.name} - make sure the name in the manual result matches what is returned from racenet`
            );
          } else {
            entries.push({
              ...firstStageResult.entry,
              ...defaultEntry,
              ...manualEntry,
              name: firstStageResult.entry.name
            });
          }
        }
      });
      recalculateDiffs(entries);
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
    !leagueRef.showLivePoints() &&
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

const getResultTeamId = (eventIndex, driver) => {
  const teamOverride = leagueRef.league.teamOverride;
  if (
    teamOverride &&
    teamOverride[driver.name] &&
    teamOverride[driver.name][eventIndex]
  ) {
    debug(
      `applying team override for ${driver.name} with team ${
        teamOverride[driver.name][eventIndex]
      }`
    );
    return teamOverride[driver.name][eventIndex];
  }
  return driver.teamId;
};

const shouldFilterDriver = (division, driverName) => {
  const driver = leagueRef.getDriver(driverName);
  const removeDrivers = get(division, "filterEntries.removeDrivers", []);
  const removeDriverByName = removeDrivers.find(removeDriverName => {
    return leagueRef.getDriver(removeDriverName) === driver;
  });
  const removeDriverByDivision =
    get(division, "filterEntries.matchDivision", false) &&
    driver.division !== division.divisionName;
  return removeDriverByName || removeDriverByDivision;
};

const filterStage = ({ stage, division }) => {
  stage.entries = stage.entries.filter(entry => {
    return !shouldFilterDriver(division, entry.name);
  });
};

const filterRacenetLeaderboardStages = ({ event, drivers, divisionName }) => {
  const division = leagueRef.divisions[divisionName];
  if (division.filterEntries) {
    event.racenetLeaderboardStages.forEach(stage => {
      filterStage({
        stage,
        division,
        drivers
      });
    });
  }
};

const calculateEventResults = ({
  event,
  divisionName,
  drivers,
  eventIndex
}) => {
  const firstStageResultsByDriver = getResultsByDriver(
    event.racenetLeaderboardStages[0].entries,
    divisionName
  );

  // alert! mutations to the racenetLeaderboard entries occur here, and should only occur here
  filterRacenetLeaderboardStages({ event, drivers, divisionName });
  const lastStageEntries =
    event.racenetLeaderboardStages[event.racenetLeaderboardStages.length - 1]
      .entries;
  setManualResults({
    eventIndex,
    entries: lastStageEntries,
    divisionName,
    firstStageResultsByDriver
  });
  setDnfIfIncorrectCar(event, lastStageEntries, divisionName);
  // TODO validate correct class
  const resultsByDriver = getResultsByDriver(lastStageEntries, divisionName);

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

  // cascade DNF results for appended events
  event.racenetLeaderboardStages.forEach(stage => {
    stage.entries.forEach(entry => {
      const driver = leagueRef.getDriver(entry.name);
      if (
        entry.isDnfEntry &&
        !resultsByDriver[driver.name].entry.isDnfEntry &&
        !resultsByDriver[driver.name].entry.isManualResult
      ) {
        debug(`cascading DNF for ${driver.name}`);
        resultsByDriver[driver.name].entry.isDnfEntry = true;
      }
      // mark each entry as dnf if the driver's last entry is a dnf
      if (resultsByDriver[driver.name].entry.isDnfEntry) {
        entry.isDnfEntry = true;
      }
    });
  });
  // end alert

  if (leagueRef.league.getAllResults)
    addStageTimesToResultsByDriver(
      resultsByDriver,
      event.racenetLeaderboardStages
    );

  // dnf entries are sorted below non-dnf entries
  const powerStageEntries = orderEntriesBy(lastStageEntries, "stageTime");
  const totalEntries = orderEntriesBy(lastStageEntries, "totalTime");
  const division = leagueRef.league.divisions[divisionName];
  if (
    event.eventStatus === eventStatuses.finished ||
    leagueRef.showLivePoints()
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
    if (division.points.stage) {
      event.racenetLeaderboardStages.forEach(stage => {
        const stageEntries = orderEntriesBy(stage.entries, "stageTime");
        updatePoints(
          resultsByDriver,
          stageEntries,
          division.points.stage,
          "stagePoints"
        );
      });
    }
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
      division.maxDriversScoringPointsForTeam,
      eventIndex
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

const removeLowestResults = (allResultsForName, dropRounds) => {
  let results = [...allResultsForName];
  if (dropRounds) {
    if (leagueRef.showLivePoints()) {
      const result = results[results.length - 1];
      if (result.entry && result.entry.isDnsEntry) {
        results.pop();
      }
    }
    const sortedResultsForName = [...results].sort(
      (a, b) => a.totalPoints - b.totalPoints
    );
    return sortedResultsForName.slice(dropRounds);
  }
  return allResultsForName;
};

const isDnsPenalty = allResultsForDriver => {
  const firstStartedEventIndex = allResultsForDriver.findIndex(
    result => !result.entry.isDnsEntry
  );
  const actualResults = allResultsForDriver.slice(firstStartedEventIndex);
  if (
    leagueRef.showLivePoints() &&
    actualResults[actualResults.length - 1].entry.isDnsEntry
  ) {
    actualResults.pop();
  }
  const dnsResults = actualResults.filter(result => result.entry.isDnsEntry);
  return dnsResults.length * 2 >= actualResults.length;
};

const calculatePromotionRelegation = ({
  standing,
  division,
  standingIndexPlusOne,
  numDrivers
}) => {
  const promotionDoubleZone =
    division.promotionRelegation.promotionDoubleZone || 0;
  const { promotionZone, relegationZone } = division.promotionRelegation;

  if (promotionDoubleZone && standingIndexPlusOne <= promotionDoubleZone) {
    standing.promotionRelegation = 2;
  } else if (
    promotionZone &&
    standingIndexPlusOne <= promotionZone + promotionDoubleZone
  ) {
    standing.promotionRelegation = 1;
  } else if (
    relegationZone &&
    numDrivers - relegationZone < standingIndexPlusOne
  ) {
    standing.promotionRelegation = -1;
  }
};

const calculatePromotionRelegations = (standings, divisionName) => {
  if (divisionName !== "overall") {
    const division = leagueRef.league.divisions[divisionName];
    if (division.promotionRelegation) {
      const nonDnsPenaltyStandings = standings.filter(
        standing => !standing.dnsPenalty
      );

      nonDnsPenaltyStandings.forEach((standing, standingIndex) =>
        calculatePromotionRelegation({
          standing,
          division,
          standingIndexPlusOne: standingIndex + 1,
          numDrivers: nonDnsPenaltyStandings.length
        })
      );
    }
  }
};

const calculateStandings = ({
  results,
  previousStandings,
  previousEvents,
  resultType,
  divisionName
}) => {
  const standings = results.map(result => {
    const standing = {
      name: result.name,
      previousPosition: null,
      divisionName: result.divisionName
    };
    const previousResultsForName = map(previousEvents, event => {
      return event.results[resultType].find(
        previousResult => previousResult.name === result.name
      );
    });
    const allResultsForName = [...previousResultsForName, result];
    const bestResultsForName = removeLowestResults(
      allResultsForName,
      leagueRef.league.dropLowestScoringRoundsNumber
    );
    standing.totalPoints = sumBy(
      allResultsForName,
      result => result.totalPoints
    );
    standing.totalPointsAfterDropRounds = sumBy(
      bestResultsForName,
      result => result.totalPoints
    );
    if (previousStandings) {
      const previousStanding = previousStandings.find(
        standing => standing.name === result.name
      );
      if (previousStanding) {
        standing.previousPosition = previousStanding.currentPosition;
      }
      if (
        resultType === resultTypes.driver &&
        leagueRef.league.enableDnsPenalty &&
        divisionName !== "overall"
      ) {
        standing.dnsPenalty = isDnsPenalty(allResultsForName);
      }
    }
    return standing;
  });
  const sortedStandings = sortBy(standings, standing => {
    const dropRoundSortModifier =
      resultType === resultTypes.driver
        ? standing.totalPointsAfterDropRounds * 1000000
        : 0;
    // sort by totalPointsAfterDropRounds first then by totalPoints if totalPointsAfterDropRounds equal
    return 0 - dropRoundSortModifier - standing.totalPoints;
  });

  for (let i = 0; i < sortedStandings.length; i++) {
    const standing = sortedStandings[i];
    if (
      i !== 0 &&
      standing.totalPoints === sortedStandings[i - 1].totalPoints &&
      standing.totalPointsAfterDropRounds ===
        sortedStandings[i - 1].totalPointsAfterDropRounds
    ) {
      // set current position to the same number if points are equal between drivers / teams
      standing.currentPosition = sortedStandings[i - 1].currentPosition;
    } else {
      standing.currentPosition = i + 1;
    }
    standing.positionChange = standing.previousPosition
      ? standing.previousPosition - standing.currentPosition
      : null;
  }
  if (resultType === resultTypes.driver) {
    calculatePromotionRelegations(sortedStandings, divisionName);
  }
  return sortedStandings;
};

const calculateEventStandings = (event, previousEvents, divisionName) => {
  const previousEvent = last(previousEvents);
  const previousDriverStandings = previousEvent
    ? previousEvent.standings.driverStandings
    : null;
  const driverStandings = calculateStandings({
    results: event.results.driverResults,
    previousStandings: previousDriverStandings,
    previousEvents,
    resultType: "driverResults",
    divisionName
  });

  const previousTeamStandings = previousEvent
    ? previousEvent.standings.teamStandings
    : null;
  const teamStandings = calculateStandings({
    results: event.results.teamResults,
    previousStandings: previousTeamStandings,
    previousEvents,
    resultType: "teamResults",
    divisionName
  });
  event.standings = { driverStandings, teamStandings };
};

const processEvent = ({
  divisionName,
  event,
  previousEvents,
  drivers,
  eventIndex
}) => {
  event.results = calculateEventResults({
    event,
    divisionName,
    drivers,
    eventIndex
  });
  calculateEventStandings(event, previousEvents, divisionName);
  if (leagueRef.league.divisions[divisionName].fantasy) {
    calculateFantasyStandings(
      event,
      last(previousEvents),
      leagueRef.league,
      divisionName
    );
  }
};

const loadEventDriver = (entry, drivers, divisionName) => {
  const division = leagueRef.league.divisions[divisionName];
  let driver = leagueRef.getDriver(entry.name);
  if (!driver) {
    debug(`adding unknown driver ${entry.name}`);
    driver = { name: entry.name };
    leagueRef.addDriver(driver);
    leagueRef.missingDrivers[entry.name] = driver;
  }

  if (division.filterEntries && shouldFilterDriver(division, entry.name)) {
    return;
  }
  driver.nationality = entry.nationality;
  if (
    !driver.firstCarDriven &&
    (!division.cars || division.cars.includes(entry.vehicleName))
  ) {
    driver.firstCarDriven = entry.vehicleName;
  }
  if (!driver.teamId && leagueRef.league.useCarAsTeam) {
    if (driver.firstCarDriven) {
      driver.teamId = vehicles[driver.firstCarDriven].brand;
    }
  }
  if (!driver.car) {
    driver.car = driver.firstCarDriven;
  }
  drivers[driver.name] = driver;
};

const loadEventDrivers = (drivers, event) => {
  event.racenetLeaderboardStages[0].entries.forEach(entry => {
    loadEventDriver(entry, drivers, event.divisionName);
  });
  event.racenetLeaderboardStages[
    event.racenetLeaderboardStages.length - 1
  ].entries.forEach(entry => {
    loadEventDriver(entry, drivers, event.divisionName);
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
  const drivers = loadDriversAcrossAllEvents(events);
  const previousEvents = [];
  for (let eventIndex = 0; eventIndex < events.length; eventIndex++) {
    const event = events[eventIndex];
    debug(`processing ${divisionName} ${event.location}`);
    processEvent({ divisionName, event, previousEvents, drivers, eventIndex });
    previousEvents.push(event);
  }
};

const calculateOverall = processedDivisions => {
  const overall = {
    events: [],
    divisionName: "overall",
    displayName: "Overall"
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
    // const previousEvent = index > 0 ? overall.events[index - 1] : null;

    const previousEvents = index > 0 ? overall.events.slice(0, index) : [];
    calculateEventStandings(event, previousEvents, overall.divisionName);
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
  calculateOverall,
  isDnsPenalty,
  calculatePromotionRelegation,
  calculatePromotionRelegations
};
