const debug = require("debug")("tkidman:dirt2-results:shared");
const moment = require("moment");
const countries = require("./state/constants/countries.json");
const { keyBy } = require("lodash");

const hiddenPath = "./hidden";
const club = process.env.CLUB || "test";
const outputPath = `${hiddenPath}/out/${club}`;
const cachePath = `${hiddenPath}/cache/${club}`;
const templatePath = `./src/output/templates`;

const privateer = "privateer";

const countriesByAlpha2Code = keyBy(Object.values(countries), "alpha2Code");

const getTotalPoints = result => {
  let totalPoints = 0;
  totalPoints += result.powerStagePoints ? result.powerStagePoints : 0;
  totalPoints += result.overallPoints ? result.overallPoints : 0;
  totalPoints += result.stagePoints ? result.stagePoints : 0;
  return totalPoints;
};

const eventStatuses = {
  active: "Active",
  finished: "Finished"
};

const resultTypes = {
  driver: "driverResults",
  team: "teamResults"
};

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
  const entry1Duration = getDuration(entry1.totalTime);
  const entry2Duration = getDuration(entry2.totalTime);
  const summedDuration = entry1Duration.add(entry2Duration);
  return formatDuration(summedDuration);
};

const addSeconds = (entryTime, numSeconds) => {
  const duration = getDuration(entryTime).add(numSeconds, "seconds");
  return formatDuration(duration);
};

const createDNFResult = (driverName, isDnsEntry) => {
  return {
    name: driverName,
    entry: {
      name: driverName,
      isDnfEntry: true,
      isDnsEntry,
      stageTime: "15:00:00.000",
      stageDiff: "N/A",
      totalTime: "23:59:59.000",
      totalDiff: "N/A"
    }
  };
};

const formatDuration = duration => {
  return moment.utc(duration.as("milliseconds")).format("HH:mm:ss.SSS");
};

const getCountryForDriver = driver => {
  if (
    !countries[driver.nationality] &&
    !countriesByAlpha2Code[driver.nationality]
  ) {
    debug(`no country found for driver: ${JSON.stringify(driver)}`);
  }
  return (
    countries[driver.nationality] ||
    countriesByAlpha2Code[driver.nationality] ||
    countries.eLngRestOfWorld
  );
};

const getCountryByAlpha2Code = alpha2Code => countriesByAlpha2Code[alpha2Code];

const max = (a, b) => {
  return a > b ? a : b;
};

// knapsack problem!! https://www.geeksforgeeks.org/0-1-knapsack-problem-dp-10/
const knapsack = (W, wt, val, n) => {
  let i, w;
  let K = new Array(n + 1);

  // Build table K[][] in bottom up manner
  for (i = 0; i <= n; i++) {
    K[i] = new Array(W + 1);
    for (w = 0; w <= W; w++) {
      if (i === 0 || w === 0) K[i][w] = 0;
      else if (wt[i - 1] <= w)
        // const prevVal = K[i - 1][w - wt[i - 1]];
        K[i][w] = max(val[i - 1] + K[i - 1][w - wt[i - 1]], K[i - 1][w]);
      else K[i][w] = K[i - 1][w];
    }
  }

  return K[n][W];
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
  formatDuration,
  getCountryForDriver,
  getCountryByAlpha2Code,
  addSeconds,
  knapsack
};
