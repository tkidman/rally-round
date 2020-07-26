const hiddenPath = "./hidden";
const club = process.env.CLUB || "test";
const outputPath = `${hiddenPath}/out/${club}`;
const cachePath = `${hiddenPath}/cache/${club}`;
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

module.exports = {
  outputPath,
  cachePath,
  hiddenPath,
  getTotalPoints,
  privateer,
  club,
  eventStatuses
};
