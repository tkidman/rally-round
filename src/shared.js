const debug = require("debug")("tkidman:rally-round:shared");
const moment = require("moment");
const countries = require("./state/constants/countries.json");
const { keyBy, sum, get } = require("lodash");

const hiddenPath = "./hidden";
const club = process.env.CLUB || "test";
const outputPath = `${hiddenPath}/out/${club}`;
const cachePath = `${hiddenPath}/cache/${club}`;
const templatePath = `./src/output/templates`;

const privateer = "privateer";

const countriesByAlpha2Code = keyBy(Object.values(countries), "alpha2Code");

const countriesByCode = keyBy(Object.values(countries), "code");

const getTotalPoints = result => {
  let totalPoints = 0;
  totalPoints += result.powerStagePoints ? result.powerStagePoints : 0;
  totalPoints += result.overallPoints ? result.overallPoints : 0;
  totalPoints += result.stagePoints ? result.stagePoints : 0;
  totalPoints += result.legPoints ? sum(result.legPoints) : 0;
  return totalPoints;
};

const eventStatuses = {
  active: "Active",
  finished: "Finished",
  future: "Future"
};

const resultTypes = {
  driver: "driverResults",
  team: "teamResults"
};

const dnfFactor = 100000000;

const getDuration = durationString => {
  if (!durationString) {
    return moment.duration(0);
  }
  if (durationString.split(":").length === 2) {
    return moment.duration(`00:${durationString}`);
  }
  return moment.duration(durationString);
};

const getSortNumber = (entry, field) => {
  const durationInMillis = getDuration(entry[field]).asMilliseconds();
  if (entry.isDnfEntry || entry.isDebutant) {
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

// field is stage or total
const recalculateDiffsForEntries = (entries, field) => {
  const timeField = `${field}Time`;
  const diffField = `${field}Diff`;
  const sortedEntries = orderEntriesBy(entries, timeField);
  if (sortedEntries.length > 0) {
    const topTime = getDuration(sortedEntries[0][timeField]);
    sortedEntries[0][diffField] = "--";
    for (let i = 1; i < sortedEntries.length; i++) {
      const entry = sortedEntries[i];
      if (!entry.isDnsEntry) {
        const entryTime = getDuration(sortedEntries[i][timeField]);
        const diff = entryTime.subtract(topTime);
        entry[diffField] = moment
          .utc(diff.as("milliseconds"))
          .format("+HH:mm:ss.SSS");
      }
    }
  }
};

const recalculateDiffs = entries => {
  recalculateDiffsForEntries(entries, "stage");
  recalculateDiffsForEntries(entries, "total");
};

const getSummedTotalTime = (entry1, entry2) => {
  return getSummedTotalTimeStrings(entry1.totalTime, entry2.totalTime);
};

const getSummedTotalTimeStrings = (time1, time2) => {
  const time1Duration = getDuration(time1);
  const time2Duration = getDuration(time2);
  const summedDuration = time1Duration.add(time2Duration);
  return formatDuration(summedDuration);
};

const addSeconds = (entryTime, numSeconds) => {
  const duration = getDuration(entryTime).add(numSeconds, "seconds");
  return formatDuration(duration);
};

const DNF_STAGE_TIME = "15:00:00.000";
const MAX_TOTAL_TIME = "23:59:59.000";
const createDNFResult = (driverName, isDnsEntry) => {
  return {
    name: driverName,
    entry: {
      name: driverName,
      isDnfEntry: true,
      isDnsEntry,
      stageTime: DNF_STAGE_TIME,
      stageDiff: "N/A",
      totalTime: MAX_TOTAL_TIME,
      totalDiff: "N/A"
    }
  };
};

const formatDuration = duration => {
  return moment.utc(duration.as("milliseconds")).format("HH:mm:ss.SSS");
};

const getCountryForAnyCode = code => {
  return (
    countries[code] ||
    countriesByAlpha2Code[code] ||
    countriesByCode[code] ||
    countriesByCode[code.toLowerCase()] ||
    countries.eLngRestOfWorld
  );
};
const getCountryForDriver = driver => {
  if (!driver.nationality) {
    debug(`driver has no nationality: ${JSON.stringify(driver)}`);
    return getCountryForAnyCode("RX"); // Default to unknown
  }
  if (
    !countries[driver.nationality] &&
    !countriesByAlpha2Code[driver.nationality] &&
    !countriesByCode[driver.nationality.toLowerCase()] &&
    !countriesByCode[driver.nationality]
  ) {
    debug(`no country found for driver: ${JSON.stringify(driver)}`);
  }
  return getCountryForAnyCode(driver.nationality);
};

const getCountryByAlpha2Code = alpha2Code => countriesByAlpha2Code[alpha2Code];

const max = (a, b) => {
  return a > b ? a : b;
};

// knapsack problem!! https://www.geeksforgeeks.org/0-1-knapsack-problem-dp-10/
const knapsack = (allowedRoundsWeight, roundWeights, points) => {
  const numRounds = points.length;
  let i, w;
  const K = new Array(numRounds + 1);

  // Build table K[][] in bottom up manner
  for (i = 0; i <= numRounds; i++) {
    K[i] = new Array(allowedRoundsWeight + 1);
    for (w = 0; w <= allowedRoundsWeight; w++) {
      if (i === 0 || w === 0) K[i][w] = 0;
      else if (roundWeights[i - 1] <= w)
        K[i][w] = max(
          points[i - 1] + K[i - 1][w - roundWeights[i - 1]],
          K[i - 1][w]
        );
      else K[i][w] = K[i - 1][w];
    }
  }

  return K[numRounds][allowedRoundsWeight];
};

const mergeEvent = (mergedEvent, event) => {
  if (mergedEvent.location !== event.location) {
    throw new Error("multiclass championship but events do not line up.");
  }
  for (let i = 0; i < event.leaderboardStages.length; i++) {
    mergedEvent.leaderboardStages[i].entries.push(
      ...event.leaderboardStages[i].entries
    );
  }
};

const useNationalityAsTeam = (leagueRef, division) => {
  return (
    leagueRef.league.useNationalityAsTeam ||
    get(division, "overrideTeam.useNationalityAsTeam")
  );
};

module.exports = {
  outputPath,
  cachePath,
  hiddenPath,
  templatePath,
  getTotalPoints,
  privateer,
  club,
  eventStatuses,
  resultTypes,
  orderEntriesBy,
  orderResultsBy,
  getDuration,
  recalculateDiffsForEntries,
  recalculateDiffs,
  createDNFResult,
  getSummedTotalTime,
  getSummedTotalTimeStrings,
  formatDuration,
  getCountryForDriver,
  getCountryByAlpha2Code,
  getCountryForAnyCode,
  addSeconds,
  knapsack,
  mergeEvent,
  useNationalityAsTeam,
  DNF_STAGE_TIME,
  MAX_TOTAL_TIME
};
