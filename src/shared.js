const debug = require("debug")("tkidman:dirt2-results:shared");

const outputPath = "./hidden/out";
const { driversById } = require("./referenceData");

const getTotalPoints = entry => {
  let totalPoints = 0;
  totalPoints += entry.powerStagePoints ? entry.powerStagePoints : 0;
  totalPoints += entry.overallPoints ? entry.overallPoints : 0;
  return totalPoints;
};

const getDriver = name => {
  const driver = driversById[name.toUpperCase()];
  if (!driver) {
    debug(`unable to find driver for driver name: ${name}`);
  }
  return driver;
};

module.exports = { outputPath, getTotalPoints, getDriver };
