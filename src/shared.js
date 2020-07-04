const hiddenPath = "./hidden";
const outputPath = `${hiddenPath}/out`;
const cachePath = `${hiddenPath}/cache`;

const getTotalPoints = entry => {
  let totalPoints = 0;
  totalPoints += entry.powerStagePoints ? entry.powerStagePoints : 0;
  totalPoints += entry.overallPoints ? entry.overallPoints : 0;
  return totalPoints;
};

module.exports = { outputPath, cachePath, hiddenPath, getTotalPoints };
