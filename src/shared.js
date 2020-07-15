const hiddenPath = "./hidden";
const club = process.env.CLUB || "brl";
const outputPath = `${hiddenPath}/out/${club}`;
const cachePath = `${hiddenPath}/cache/${club}`;

const getTotalPoints = result => {
  let totalPoints = 0;
  totalPoints += result.powerStagePoints ? result.powerStagePoints : 0;
  totalPoints += result.overallPoints ? result.overallPoints : 0;
  return totalPoints;
};

const championshipTypes = {
  single: "SINGLE",
  multiple: "MULTIPLE",
  events: "EVENTS"
};
module.exports = {
  outputPath,
  cachePath,
  hiddenPath,
  getTotalPoints,
  championshipTypes,
  club
};
