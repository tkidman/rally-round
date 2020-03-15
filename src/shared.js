const debug = require("debug")("tkidman:dirt2-results:shared");

const outputPath = "./hidden/out";

const getTotalPoints = entry => {
  let totalPoints = 0;
  totalPoints += entry.powerStagePoints ? entry.powerStagePoints : 0;
  totalPoints += entry.overallPoints ? entry.overallPoints : 0;
  return totalPoints;
};

module.exports = { outputPath, getTotalPoints };
