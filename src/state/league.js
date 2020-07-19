const { keyBy } = require("lodash");
const Papa = require("papaparse");
const fs = require("fs");
const debug = require("debug")("tkidman:dirt2-results:state");
const { club } = require("../shared");
const league = require(`./${club}/initialState`);

const driverFieldNames = require("./constants/driverFieldNames");

const missingDrivers = {};

const loadDriversFromMasterSheet = () => {
  if (fs.existsSync(`./src/state/${club}/drivers.csv`)) {
    const csv = fs.readFileSync(`./src/state/${club}/drivers.csv`, "utf8");
    const driverColumns = require(`./${club}/driverColumns`);

    const rows = Papa.parse(csv, { header: true }).data;
    const driversById = rows.reduce((driversById, row) => {
      const driverNameValue = row[driverColumns[driverFieldNames.name]];
      if (driverNameValue) {
        const id = driverNameValue.toUpperCase();
        driversById[id] = {
          id,
          [driverFieldNames.name]: driverNameValue,
          [driverFieldNames.raceNetName]:
            row[driverColumns[driverFieldNames.raceNetName]],
          [driverFieldNames.discordName]:
            row[driverColumns[driverFieldNames.discordName]],
          [driverFieldNames.teamId]:
            row[driverColumns[driverFieldNames.teamId]],
          [driverFieldNames.countryName]:
            row[driverColumns[driverFieldNames.countryName]],
          [driverFieldNames.division]:
            row[driverColumns[driverFieldNames.division]],
          [driverFieldNames.car]: row[driverColumns[driverFieldNames.car]]
        };
      } else {
        debug(
          `Missing driver name in column ${
            driverColumns[driverFieldNames.name]
          }`
        );
      }
      return driversById;
    }, {});
    const driversByRaceNet = keyBy(Object.values(driversById), driver =>
      driver.raceNetName.toUpperCase()
    );
    return { driversById, driversByRaceNet };
  }
  return { driversById: {}, driversByRaceNet: {} };
};

const { driversById, driversByRaceNet } = loadDriversFromMasterSheet(club);

const getDriver = name => {
  const upperName = name.toUpperCase();
  let driver = driversById[upperName];
  if (!driver) {
    driver = driversByRaceNet[upperName];
    if (!driver) {
      driver = Object.values(driversByRaceNet).find(driver => {
        return (
          driver.raceNetName.toUpperCase().includes(upperName) ||
          driver.name.toUpperCase().includes(upperName) ||
          driver.discordName.toUpperCase().includes(upperName)
        );
      });
      if (!driver) {
        missingDrivers[name] = name;
      }
    }
  }
  return driver;
};

const getDriversByDivision = division => {
  return Object.values(driversById).filter(driver => {
    return (
      driver.division &&
      driver.division.toUpperCase() === division.toUpperCase()
    );
  });
};

const printMissingDrivers = () =>
  debug(`missing drivers: \n${Object.keys(missingDrivers).join("\n")}`);

module.exports = {
  league,
  getDriver,
  getDriversByDivision,
  printMissingDrivers
};
