const { downloadCache } = require("./api/aws/s3");
const { orderResultsBy, knapsack } = require("./shared");
const { orderEntriesBy } = require("./shared");
const debug = require("debug")("tkidman:dirt2-results");
const { eventStatuses } = require("./shared");
const { privateer } = require("./shared");
const { printMissingDrivers, getTeamIds } = require("./state/league");
const { sortBy, keyBy, sum } = require("lodash");
const { cachePath } = require("./shared");
const fs = require("fs");
const { createDNFResult } = require("./shared");
const { cloneDeep, last, get } = require("lodash");
const { recalculateDiffsForEntries } = require("./shared");
const vehicles = require("./state/constants/vehicles.json");
const { addSeconds } = require("./shared");
const { resultTypes } = require("./shared");
const { map } = require("lodash");
const { sumBy } = require("lodash");
const { recalculateDiffs } = require("./shared");

const { init, leagueRef } = require("./state/league");
const { writeOutput, checkOutputDirs } = require("./output/output");
const { getTotalPoints } = require("./shared");
const { calculateFantasyStandings } = require("./fantasy/fantasyCalculator");
const { fetchEvents } = require("./fetch/fetch");

const updatePoints = ({
  resultsByDriver,
  orderedEntries,
  points,
  pointsField,
  event
}) => {
  for (let i = 0; i < points.length; i++) {
    if (orderedEntries.length > i) {
      const entry = orderedEntries[i];
      const driver = leagueRef.getDriver(entry.name);
      if (!entry.isDnfEntry || leagueRef.league.pointsForDNF) {
        let newPoints = points[i];

        if (
          leagueRef.league.noSuperRallyPointsMultiplier &&
          !entry.superRally &&
          pointsField === "overallPoints"
        ) {
          newPoints *= leagueRef.league.noSuperRallyPointsMultiplier;
        }

        if (event.enduranceRoundMultiplier && pointsField === "overallPoints") {
          newPoints *= event.enduranceRoundMultiplier;
        }
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
  const teamIds = getTeamIds();
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
  teamIds.forEach(teamId => {
    if (!teamResults[teamId]) {
      // add missing result for teams added after the championship has started
      teamResults[teamId] = {
        name: teamId,
        totalPoints: 0,
        driverResultsCounted: 0
      };
    }
  });
  return teamResults;
};

const sortTeamResults = teamResultsById => {
  const teamResults = sortBy(
    Object.values(teamResultsById),
    teamResult => teamResult.totalPoints
  );
  return teamResults.reverse();
};

const applyIncorrectCarPenalty = entry => {
  if (leagueRef.league.incorrectCarTimePenaltySeconds) {
    entry.totalTime = addSeconds(
      entry.totalTime,
      leagueRef.league.incorrectCarTimePenaltySeconds
    );
    entry.stageTime = addSeconds(
      entry.stageTime,
      leagueRef.league.incorrectCarTimePenaltySeconds
    );
    entry.penaltyReason = "Wrong car choice";
  } else {
    entry.isDnfEntry = true;
    entry.disqualificationReason = "Wrong car choice";
  }
};
const applyPenaltyIfIncorrectCar = (event, lastStageEntries, divisionName) => {
  // validate correct car usage
  lastStageEntries.forEach(entry => {
    const driver = leagueRef.getDriver(entry.name);
    const division = leagueRef.league.divisions[divisionName];
    const driverCar = get(driver, "car");
    if (driverCar) {
      if (
        !division.disableSameCarValidation &&
        driver.car !== entry.vehicleName
      ) {
        debug(
          `driver ${entry.name} used wrong car ${entry.vehicleName}, should have used ${driver.car}. Applying incorrect car penalty`
        );
        applyIncorrectCarPenalty(entry);
      }
      if (
        division.enableSameCarClassValidation &&
        vehicles[driver.car].class !== vehicles[entry.vehicleName].class
      ) {
        debug(
          `driver ${entry.name} used wrong car class ${
            vehicles[entry.vehicleName].class
          }, should have used ${
            vehicles[driver.car].class
          }. Applying incorrect car penalty`
        );
        applyIncorrectCarPenalty(entry);
      }
    }
    if (division.cars && !division.cars.includes(entry.vehicleName)) {
      debug(
        `driver ${entry.name} used wrong car ${entry.vehicleName}, should have used one of ${division.cars}. Applying incorrect car penalty`
      );
      applyIncorrectCarPenalty(entry);
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
          const driver = leagueRef.getDriver(manualEntry.name);
          const firstStageResult = firstStageResultsByDriver[driver.name];
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

const addStageTimesToResultsByDriver = (resultsByDriver, leaderboardStages) => {
  leaderboardStages.forEach(leadboardStage => {
    leadboardStage.entries.forEach(driverTime => {
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

const isDuplicateEntryNotFirstCarDriven = (entryCountByDriver, entry) => {
  const duplicateEntryNotFirstCarDriven =
    entryCountByDriver[entry.name] > 1 &&
    leagueRef.getDriver(entry.name).firstCarDriven !== entry.vehicleName;
  if (duplicateEntryNotFirstCarDriven) {
    debug(`Filtering duplicate entry for ${entry.name}`);
  }
  return duplicateEntryNotFirstCarDriven;
};
const filterStage = ({ stage, division }) => {
  // can get duplicate entries if a division is 2 clubs combined
  const entryCountByDriver = stage.entries.reduce(
    (entryCountByDriver, entry) => {
      if (!entryCountByDriver[entry.name]) {
        entryCountByDriver[entry.name] = 0;
      }
      entryCountByDriver[entry.name]++;
      return entryCountByDriver;
    },
    {}
  );

  stage.entries = stage.entries.filter(entry => {
    return (
      !shouldFilterDriver(division, entry.name) &&
      !isDuplicateEntryNotFirstCarDriven(entryCountByDriver, entry)
    );
  });
  recalculateDiffs(stage.entries);
};

const filterLeaderboardStages = ({ event, drivers, divisionName }) => {
  const division = leagueRef.divisions[divisionName];
  if (division.filterEntries) {
    event.leaderboardStages.forEach(stage => {
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
    event.leaderboardStages[0].entries,
    divisionName
  );

  // alert! mutations to the racenetLeaderboard entries occur here, and should only occur here
  filterLeaderboardStages({ event, drivers, divisionName });
  const lastStageEntries =
    event.leaderboardStages[event.leaderboardStages.length - 1].entries;
  setManualResults({
    eventIndex,
    entries: lastStageEntries,
    divisionName,
    firstStageResultsByDriver
  });
  applyPenaltyIfIncorrectCar(event, lastStageEntries, divisionName);
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
  event.leaderboardStages.forEach(stage => {
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

  event.leaderboardStages.forEach(stage => {
    recalculateDiffs(stage.entries);
  });
  // end alert

  if (leagueRef.league.getAllResults)
    addStageTimesToResultsByDriver(resultsByDriver, event.leaderboardStages);

  // dnf entries are sorted below non-dnf entries
  const powerStageEntries = orderEntriesBy(lastStageEntries, "stageTime");
  const totalEntries = orderEntriesBy(lastStageEntries, "totalTime");
  const division = leagueRef.league.divisions[divisionName];
  if (
    event.eventStatus === eventStatuses.finished ||
    leagueRef.showLivePoints()
  ) {
    updatePoints({
      resultsByDriver,
      orderedEntries: powerStageEntries,
      points: division.points.powerStage,
      pointsField: "powerStagePoints",
      event
    });
    updatePoints({
      resultsByDriver,
      orderedEntries: totalEntries,
      points: division.points.overall,
      pointsField: "overallPoints",
      event
    });
    if (division.points.stage) {
      event.leaderboardStages.forEach(stage => {
        const stageEntries = orderEntriesBy(stage.entries, "stageTime");
        updatePoints({
          resultsByDriver,
          orderedEntries: stageEntries,
          points: division.points.stage,
          pointsField: "stagePoints",
          event
        });
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

const calculateTotalPointsAfterDropRounds = ({
  allResultsForName,
  totalPoints,
  events,
  dropRounds,
  showLivePoints
}) => {
  const results = [...allResultsForName];
  if (dropRounds) {
    if (showLivePoints) {
      const result = results[results.length - 1];
      if (result.entry && result.entry.isDnsEntry) {
        results.pop();
      }
    }
    const points = results.map(result => result.totalPoints);
    const roundWeights = events
      .map(event => event.enduranceRoundMultiplier || 1)
      .slice(0, points.length);
    const allowedRoundsWeight = Math.max(sum(roundWeights) - dropRounds, 0);
    const pointsAfterDropRounds = knapsack(
      allowedRoundsWeight,
      roundWeights,
      points
    );
    return pointsAfterDropRounds;
  }
  return totalPoints;
};

const isDnsPenalty = allResultsForDriver => {
  const firstStartedEventIndex = allResultsForDriver.findIndex(
    result => !result.entry.isDnsEntry
  );
  const firstEventIndex = leagueRef.league.dnsPenaltyFromFirstRound
    ? 0
    : firstStartedEventIndex;
  const actualResults = allResultsForDriver.slice(firstEventIndex);
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
  divisionName,
  currentEvent
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
    standing.totalPoints = sumBy(
      allResultsForName,
      result => result.totalPoints
    );
    standing.totalPointsAfterDropRounds = calculateTotalPointsAfterDropRounds({
      allResultsForName,
      totalPoints: standing.totalPoints,
      events: [...(previousEvents || []), currentEvent],
      dropRounds: leagueRef.league.dropLowestScoringRoundsNumber,
      showLivePoints: leagueRef.showLivePoints()
    });
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
    if (resultType === resultType.team) {
      return 0 - standing.totalPoints;
    }

    if (leagueRef.league.sortByDropRoundPoints) {
      const dropRoundSortModifier =
        standing.totalPointsAfterDropRounds * 1000000;
      // sort by totalPointsAfterDropRounds first then by totalPoints if totalPointsAfterDropRounds equal
      return 0 - dropRoundSortModifier - standing.totalPoints;
    }

    const totalPointsSortModifier = standing.totalPoints * 1000000;
    // sort by totalPoints first then by totalPointsAfterDropRounds if totalPoints are equal
    return 0 - totalPointsSortModifier - standing.totalPointsAfterDropRounds;
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
    divisionName,
    currentEvent: event
  });

  const previousTeamStandings = previousEvent
    ? previousEvent.standings.teamStandings
    : null;
  const teamStandings = calculateStandings({
    results: event.results.teamResults,
    previousStandings: previousTeamStandings,
    previousEvents,
    resultType: "teamResults",
    divisionName,
    currentEvent: event
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
  if (!driver.nationality) {
    driver.nationality = entry.nationality;
  }
  if (
    !driver.firstCarDriven &&
    (!division.cars || division.cars.includes(entry.vehicleName))
  ) {
    driver.firstCarDriven = entry.vehicleName;
  }
  if (!driver.teamId) {
    if (leagueRef.league.useCarAsTeam) {
      if (driver.firstCarDriven) {
        driver.teamId = vehicles[driver.firstCarDriven].brand;
      }
    } else if (leagueRef.league.useNationalityAsTeam) {
      driver.teamId = driver.nationality;
    } else if (leagueRef.league.useCarClassAsTeam) {
      if (driver.firstCarDriven) {
        driver.teamId = vehicles[driver.firstCarDriven].class;
      }
    } else if (leagueRef.league.nullTeamIsPrivateer) {
      driver.teamId = privateer;
    }
  }
  if (!driver.car) {
    driver.car = driver.firstCarDriven;
  }
  drivers[driver.name] = driver;
};

const loadEventDrivers = (drivers, event) => {
  event.leaderboardStages[0].entries.forEach(entry => {
    loadEventDriver(entry, drivers, event.divisionName);
  });
  event.leaderboardStages[event.leaderboardStages.length - 1].entries.forEach(
    entry => {
      loadEventDriver(entry, drivers, event.divisionName);
    }
  );
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
    debug(`processing ${divisionName} ${event.location || event.locationName}`);
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
      const getAllResults =
        leagueRef.league.getAllResults || division.points.stage;
      division.events = await fetchEvents(
        division,
        divisionName,
        getAllResults
      );
      division.events.forEach(event => (event.divisionName = divisionName));
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
  calculatePromotionRelegations,
  calculateTotalPointsAfterDropRounds
};
