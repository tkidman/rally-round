const moment = require("moment");

const hiddenPath = "./hidden";
const club = process.env.CLUB || "test";
const outputPath = `${hiddenPath}/out/${club}`;
const cachePath = `${hiddenPath}/cache/${club}`;
const templatePath = `./src/output/templates`;

const privateer = "privateer";

const getTotalPoints = result => {
  let totalPoints = 0;
  totalPoints += result.powerStagePoints ? result.powerStagePoints : 0;
  totalPoints += result.overallPoints ? result.overallPoints : 0;
  return totalPoints;
};

const eventStatuses = {
  active: "Active",
  finished: "Finished"
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

module.exports = {
  outputPath,
  cachePath,
  hiddenPath,
  templatePath,
  getTotalPoints,
  privateer,
  club,
  eventStatuses,
  orderEntriesBy,
  orderResultsBy,
  getDuration,
  recalculateDiffsForEntries,
  createDNFResult
};
