const hiddenPath = "./hidden";
const outputPath = `${hiddenPath}/out`;
const cachePath = `${hiddenPath}/cache`;

const getTotalPoints = result => {
  let totalPoints = 0;
  totalPoints += result.powerStagePoints ? result.powerStagePoints : 0;
  totalPoints += result.overallPoints ? result.overallPoints : 0;
  return totalPoints;
};

module.exports = { outputPath, cachePath, hiddenPath, getTotalPoints };
