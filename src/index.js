const { downloadCache } = require("./api/aws/s3");
const {
  orderResultsBy,
  knapsack,
  getDuration,
  DNF_STAGE_TIME,
  getSummedTotalTimeStrings
} = require("./shared");
const { orderEntriesBy } = require("./shared");
const debug = require("debug")("tkidman:rally-round");
const { eventStatuses } = require("./shared");
const { privateer } = require("./shared");
const {
  printMissingDrivers,
  getTeamIds,
  getCarByName
} = require("./state/league");
const {
  sortBy,
  keyBy,
  sum,
  flatMap,
  minBy,
  isEmpty,
  slice,
  forEach,
  findIndex
} = require("lodash");
const { cachePath } = require("./shared");
const fs = require("fs");
const { createDNFResult } = require("./shared");
const { cloneDeep, last, get } = require("lodash");
const { recalculateDiffsForEntries } = require("./shared");
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
const { getLocalization } = require("./output/localization");

const updatePoints = ({
  resultsByDriver,
  orderedEntries,
  points,
  pointsField,
  event,
  legIndex
}) => {
  for (let i = 0; i < points.length; i++) {
    if (orderedEntries.length > i) {
      const entry = orderedEntries[i];
      const driver = leagueRef.getDriver(entry.name);

      if (
        (!entry.isDnfEntry || leagueRef.league.pointsForDNF) &&
        !entry.isDebutant
      ) {
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

        if (pointsField === "legPoints") {
          resultsByDriver[driver.name].legPoints[legIndex] = newPoints;
          // orderedEntries is a deep clone when updating legPoints.
          // tracking overall points here to show a results page for the leg
          entry.overallPoints = newPoints;
        } else {
          if (resultsByDriver[driver.name][pointsField]) {
            newPoints += resultsByDriver[driver.name][pointsField];
          }
          resultsByDriver[driver.name][pointsField] = newPoints;
        }
      }

      if (
        !entry.isDnfEntry &&
        entry.isDebutant &&
        pointsField === "overallPoints"
      ) {
        resultsByDriver[driver.name][pointsField] =
          leagueRef.league.numPointsForDebutant;
      }
    }
  }
};

const getTotalPointsForTeam = driverResult => {
  if (leagueRef.league.teamPointsForPowerstage) {
    return driverResult.totalPoints;
  }
  const powerStagePoints = driverResult.powerStagePoints || 0;
  return driverResult.totalPoints - powerStagePoints;
};

const calculateTeamResults = (
  driverResults,
  maxDriversScoringPointsForTeam,
  eventIndex
) => {
  const sortedDriverResults = [...driverResults].sort(
    (a, b) => getTotalPointsForTeam(b) - getTotalPointsForTeam(a)
  );
  const teamIds = getTeamIds();
  const teamResults = sortedDriverResults.reduce((teamResults, result) => {
    const driver = leagueRef.getDriver(result.name);
    if (driver) {
      const resultTeamId = getResultTeamId(eventIndex, driver);
      const totalPointsForTeam = getTotalPointsForTeam(result);
      result.teamId = resultTeamId;
      if (resultTeamId && resultTeamId !== privateer) {
        if (!teamResults[resultTeamId]) {
          teamResults[resultTeamId] = {
            name: resultTeamId,
            totalPoints: 0,
            driverResultsCounted: 0
          };
        }
        if (totalPointsForTeam > 0) {
          const maxDriversReached =
            maxDriversScoringPointsForTeam &&
            teamResults[resultTeamId].driverResultsCounted >=
              maxDriversScoringPointsForTeam;
          if (!maxDriversReached) {
            teamResults[resultTeamId].totalPoints += totalPointsForTeam;
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

const sortResults = resultsById => {
  const results = sortBy(
    Object.values(resultsById),
    result => result.totalPoints
  );
  return results.reverse();
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
    entry.extraInfo = `${leagueRef.league.incorrectCarTimePenaltySeconds} ${
      getLocalization().second_penalty
    }`;
  } else {
    entry.isDnfEntry = true;
    entry.disqualificationReason = getLocalization().incorrect_car_choice;
    entry.extraInfo = getLocalization().incorrect_car_choice;
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
        getCarByName(driver.car).class !== getCarByName(entry.vehicleName).class
      ) {
        debug(
          `driver ${entry.name} used wrong car class ${
            getCarByName(entry.vehicleName).class
          }, should have used ${
            getCarByName(driver.car).class
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
    if (
      division.excludedCars &&
      division.excludedCars.some(excludedCar => {
        return entry.vehicleName.includes(excludedCar);
      })
    ) {
      debug(
        `driver ${entry.name} used excluded car ${entry.vehicleName}. Applying incorrect car penalty`
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
  if (
    !isEmpty(division.manualResults) ||
    !isEmpty(leagueRef.league.manualResults)
  ) {
    const allManualResults = [];
    if (!isEmpty(division.manualResults)) {
      allManualResults.push(...division.manualResults);
    }
    if (!isEmpty(leagueRef.league.manualResults)) {
      allManualResults.push(...leagueRef.league.manualResults);
    }

    // not the best data structure: [{ eventIndex, results: [] }]
    const eventManualResults = allManualResults.filter(
      eventManualResults => eventManualResults.eventIndex === eventIndex
    );
    // flatmap to collect all the nested results in one array
    const results = flatMap(eventManualResults, "results");
    if (results) {
      results.forEach(manualEntry => {
        debug(`applying manual result for ${manualEntry.name}`);
        if (!manualEntry.extraInfo) {
          manualEntry.extraInfo = getLocalization().manual_result_applied;
        }
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
              `unable to find first stage result for manual result for driver ${manualEntry.name} - assuming not a part of this division`
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

const getAllResultsByDriver = leaderboardStages => {
  const allResultsByDriver = leaderboardStages.reduce((acc, stage) => {
    const resultsByDriver = getResultsByDriver(stage.entries);
    Object.keys(resultsByDriver).forEach(driverName => {
      if (acc[driverName]) {
        acc[driverName].push(resultsByDriver[driverName]);
      } else {
        acc[driverName] = [resultsByDriver[driverName]];
      }
    });
    return acc;
  }, {});
  return allResultsByDriver;
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

const getEventIndex = (division, event) => {
  const eventIndex = findIndex(division.events, event);
  return eventIndex;
};

const shouldFilterDriver = (division, entry, event) => {
  const { vehicleName, name: driverName } = entry;
  const driver = leagueRef.getDriver(driverName);
  const removeDrivers = get(division, "filterEntries.removeDrivers", []);
  const removeDriverByName = removeDrivers.find(removeDriverName => {
    return leagueRef.getDriver(removeDriverName) === driver;
  });

  const divisionOverride = leagueRef.league.divisionOverride || {};
  let driverDivision = driver.division;
  if (divisionOverride[driver.name]) {
    const eventIndex = getEventIndex(division, event);
    driverDivision = divisionOverride[driver.name][eventIndex];
  }
  const removeDriverByDivision =
    get(division, "filterEntries.matchDivision", false) &&
    driverDivision !== division.divisionName;

  const allowedCars = get(division, "filterEntries.allowedCars");
  const removeDriverByCar =
    !isEmpty(allowedCars) && !allowedCars.includes(vehicleName);
  return removeDriverByName || removeDriverByDivision || removeDriverByCar;
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
const filterStage = ({ stage, division, event }) => {
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
      !shouldFilterDriver(division, entry, event) &&
      !isDuplicateEntryNotFirstCarDriven(entryCountByDriver, entry)
    );
  });
  recalculateDiffs(stage.entries);
};

const filterLeaderboardStages = ({ event, drivers, divisionName }) => {
  const division = leagueRef.divisions[divisionName];

  // using this as a quick way to show results for a leg - create a whole division to track leg 1, leg 2 etc.
  // points for a leg are still calculated as part of the proper event though
  if (division.legNumber > 0) {
    event.leaderboardStages = slice(
      event.leaderboardStages,
      event.legs[division.legNumber - 1].startIndex,
      event.legs[division.legNumber - 1].endIndex + 1
    );
    recalculateTotalTime({ stages: event.leaderboardStages });
  }
  if (division.filterEntries) {
    event.leaderboardStages.forEach(stage => {
      filterStage({
        stage,
        division,
        event
      });
    });
  }
};

// rallysprint - use the fastest stage time as total time
const processRallysprint = event => {
  const allResultsByDriver = getAllResultsByDriver(event.leaderboardStages);
  Object.keys(allResultsByDriver).forEach(driverName => {
    const driverEventResults = allResultsByDriver[driverName];
    const minResult = minBy(driverEventResults, result =>
      getDuration(result.entry.stageTime)
    );
    // just update the total time on the final stage for now. Would probably be better to
    // update total time on every stage as it goes but not important yet
    // OR we could have a new field - bestResult?
    driverEventResults[driverEventResults.length - 1].entry.totalTime =
      minResult.entry.stageTime;

    // if a driver finishes the first stage, their run is not a DNF
    if (minResult.entry.stageTime !== DNF_STAGE_TIME) {
      driverEventResults[
        driverEventResults.length - 1
      ].entry.isDnfEntry = false;
      driverEventResults[
        driverEventResults.length - 1
      ].entry.isDnsEntry = false;
    }
  });
};
const calculateEventResults = ({
  event,
  divisionName,
  drivers,
  eventIndex
}) => {
  // alert! mutations to the racenetLeaderboard entries occur here, and should only occur here
  filterLeaderboardStages({ event, drivers, divisionName });

  const firstStageResultsByDriver = getResultsByDriver(
    event.leaderboardStages[0].entries,
    divisionName
  );

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

  if (leagueRef.league.isRallySprint) {
    processRallysprint(event);
  }

  event.leaderboardStages.forEach(stage => {
    recalculateDiffs(stage.entries);
  });

  // end alert

  if (leagueRef.league.getAllResults) {
    addStageTimesToResultsByDriver(resultsByDriver, event.leaderboardStages);
  }
  // dnf entries are sorted below non-dnf entries
  const powerStageEntries = orderEntriesBy(lastStageEntries, "stageTime");
  const totalEntries = orderEntriesBy(lastStageEntries, "totalTime");
  const division = leagueRef.league.divisions[divisionName];
  const legResults = [];

  if (
    event.eventStatus === eventStatuses.finished ||
    leagueRef.showLivePoints()
  ) {
    if (division.points.powerStage) {
      updatePoints({
        resultsByDriver,
        orderedEntries: powerStageEntries,
        points: division.points.powerStage,
        pointsField: "powerStagePoints",
        event
      });
    }
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

    if (!isEmpty(division.points.leg)) {
      const driverResults = Object.values(resultsByDriver);
      for (const result of driverResults) {
        result.legPoints = [];
        for (let i = 0; i < event.legs.length; i++) {
          result.legPoints.push(null);
        }
      }
      forEach(event.legs, (leg, legIndex) => {
        const legStages = cloneDeep(
          slice(event.leaderboardStages, leg.startIndex, leg.endIndex + 1)
        );
        recalculateTotalTime({ stages: legStages });
        const lastLegStageEntries = legStages[legStages.length - 1].entries;
        const sortedLastLegStageEntries = orderEntriesBy(
          lastLegStageEntries,
          "totalTime"
        );
        updatePoints({
          resultsByDriver,
          orderedEntries: sortedLastLegStageEntries,
          points: division.points.leg,
          pointsField: "legPoints",
          event,
          legIndex
        });
        const lastLegStageResults = map(sortedLastLegStageEntries, entry => {
          const result = {
            ...leagueRef.getDriver(entry.name),
            entry,
            overallPoints: entry.overallPoints,
            divisionName
          };
          result.totalPoints = getTotalPoints(result);
          result.pointsDisplay = getTotalPointsDisplay(result, event);
          return result;
        });
        legResults.push(lastLegStageResults);
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
  event.driverLegsResults = legResults;
  const teamResults = [];
  if (leagueRef.hasTeams) {
    const teamResultsById = calculateTeamResults(
      driverResults,
      division.maxDriversScoringPointsForTeam,
      eventIndex
    );
    teamResults.push(...sortResults(teamResultsById));
  }

  driverResults.forEach(result => (result.divisionName = divisionName));
  teamResults.forEach(result => {
    result.divisionName = divisionName;
    result.pointsDisplay = getTotalPointsDisplay(result, event);
  });
  return { driverResults, teamResults };
};

const recalculateTotalTime = ({ stages }) => {
  let previousEntriesByDriverName = {};
  for (const stage of stages) {
    for (const entry of stage.entries) {
      const previousTotalTime = previousEntriesByDriverName[entry.name]
        ? previousEntriesByDriverName[entry.name].totalTime
        : "00:00";
      entry.totalTime = getSummedTotalTimeStrings(
        previousTotalTime,
        entry.stageTime
      );
    }
    previousEntriesByDriverName = keyBy(stage.entries, "name");
    recalculateDiffs(stage.entries);
  }
};

const calculateTotalPointsAfterDropRounds = ({
  allResultsForName,
  totalPoints,
  events,
  dropRounds,
  showLivePoints,
  resultType
}) => {
  const results = [...allResultsForName];
  if (dropRounds && resultType === resultTypes.driver) {
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
      showLivePoints: leagueRef.showLivePoints(),
      resultType
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

const loadEventDriver = (entry, drivers, event) => {
  const divisionName = event.divisionName;
  const division = leagueRef.league.divisions[divisionName];
  let driver = leagueRef.getDriver(entry.name);
  if (!driver) {
    debug(`adding unknown driver ${entry.name}`);
    driver = { name: entry.name };
    leagueRef.addDriver(driver);
    leagueRef.missingDrivers[entry.name] = driver;
  }

  if (division.filterEntries && shouldFilterDriver(division, entry, event)) {
    return;
  }
  if (!driver.nationality) {
    driver.nationality = entry.nationality;
  }
  if (
    !driver.firstCarDriven &&
    (!division.cars || division.cars.includes(entry.vehicleName)) &&
    (!division.excludedCars ||
      !division.excludedCars.some(excludedCar => {
        return entry.vehicleName.includes(excludedCar);
      }))
  ) {
    driver.firstCarDriven = entry.vehicleName;
  }
  if (!driver.teamId) {
    if (leagueRef.league.useCarAsTeam) {
      if (driver.firstCarDriven) {
        driver.teamId = getCarByName(driver.firstCarDriven).brand;
      }
    } else if (leagueRef.league.useNationalityAsTeam) {
      driver.teamId = driver.nationality;
    } else if (leagueRef.league.useCarClassAsTeam) {
      if (driver.firstCarDriven) {
        driver.teamId = getCarByName(driver.firstCarDriven).class;
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
    loadEventDriver(entry, drivers, event);
  });
  event.leaderboardStages[event.leaderboardStages.length - 1].entries.forEach(
    entry => {
      loadEventDriver(entry, drivers, event);
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

const aggregateOverallResults = ({ overallEvent, resultType, event }) => {
  const overallResultsByName = keyBy(overallEvent.results[resultType], "name");
  event.results[resultType].forEach(result => {
    if (!overallResultsByName[result.name]) {
      overallResultsByName[result.name] = {
        ...result,
        divisionName: "overall"
      };
    } else {
      overallResultsByName[result.name].totalPoints += result.totalPoints;
    }
  });
  overallEvent.results[resultType] = sortResults(overallResultsByName);
  overallEvent.results[resultType].forEach(result => {
    result.pointsDisplay = getTotalPointsDisplay(result, event);
  });
};

const calculateOverall = processedDivisions => {
  const overall = {
    events: [],
    divisionName: "overall",
    displayName: getLocalization().overall
  };
  Object.keys(processedDivisions).forEach(divisionName => {
    const division = processedDivisions[divisionName];
    division.events.forEach((event, index) => {
      let overallEvent = overall.events[index];
      if (!overallEvent) {
        overallEvent = {
          location: event.location,
          locationName: event.locationName,
          locationFlag: event.locationFlag,
          endTime: event.endTime,
          eventStatus: event.eventStatus,
          divisionName: "overall",
          results: { driverResults: [], teamResults: [], driverLegsResults: [] }
        };
        overall.events.push(overallEvent);
      }

      if (!leagueRef.league.aggregateDriverResultsInOverall) {
        const driverResultsWithDivisionName = event.results.driverResults.map(
          result =>
            Object.assign({ divisionName: divisionName }, cloneDeep(result))
        );
        overallEvent.results.driverResults.push(
          ...driverResultsWithDivisionName
        );
      } else {
        aggregateOverallResults({
          overallEvent,
          resultType: resultTypes.driver,
          event
        });
      }

      // team results
      aggregateOverallResults({
        overallEvent,
        resultType: resultTypes.team,
        event
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
  sortResults,
  processEvent,
  calculateEventStandings,
  calculateOverall,
  isDnsPenalty,
  calculatePromotionRelegation,
  calculatePromotionRelegations,
  calculateTotalPointsAfterDropRounds
};
