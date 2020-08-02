const { keyBy } = require("lodash");
const Papa = require("papaparse");
const fs = require("fs");
const debug = require("debug")("tkidman:dirt2-results:state");
const { club } = require("../shared");
const league = require(`./${club}/initialState`);
const { driverColumns, sheetsConfig } = require(`./${club}/driverConfig`);
const driverFieldNames = require("./constants/driverFieldNames");
const { loadSheetAndTransform } = require("../sheetsAPI/sheets");

const missingDrivers = {};
const drivers = {};
const leagueRef = {};

// driver rows is an array of objects of column headers to cell values (ie: [{ racenet: "satchmo", ... }] )
const transformDriverRows = driverRows => {
  const driversById = driverRows.reduce((driversById, row) => {
    const driverNameValue = row[driverColumns[driverFieldNames.name]];
    if (driverNameValue) {
      const id = driverNameValue.toUpperCase();
      driversById[id] = {
        id,
        [driverFieldNames.name]: driverNameValue,
        [driverFieldNames.raceNetName]:
          row[driverColumns[driverFieldNames.raceNetName]],
        [driverFieldNames.teamId]: row[driverColumns[driverFieldNames.teamId]],
        [driverFieldNames.division]:
          row[driverColumns[driverFieldNames.division]],
        [driverFieldNames.car]: row[driverColumns[driverFieldNames.car]]
      };
    } else {
      debug(
        `Missing driver name in column ${driverColumns[driverFieldNames.name]}`
      );
    }
    return driversById;
  }, {});
  const driversByRaceNet = keyBy(Object.values(driversById), driver =>
    driver.raceNetName.toUpperCase()
  );
  return { driversById, driversByRaceNet };
};

const loadDriversFromSheets = async () => {
  debug("attempting to load drivers from google sheets");
  const driverRows = await loadSheetAndTransform(sheetsConfig);
  return transformDriverRows(driverRows);
};

const loadDriversFromLocalCSV = () => {
  debug("attempting to load drivers from drivers.csv");
  const csv = fs.readFileSync(`./src/state/${club}/drivers.csv`, "utf8");

  const rows = Papa.parse(csv, { header: true }).data;
  return transformDriverRows(rows);
};

const loadDrivers = async () => {
  if (sheetsConfig && process.env.GOOGLE_SHEETS_API_KEY) {
    return loadDriversFromSheets();
  } else if (fs.existsSync(`./src/state/${club}/drivers.csv`)) {
    return loadDriversFromLocalCSV();
  }
  debug("no driver config found, team functionality will not work");
  return { driversById: {}, driversByRaceNet: {} };
};

const init = async () => {
  const { driversById, driversByRaceNet } = await loadDrivers();
  drivers.driversById = driversById;
  drivers.driversByRaceNet = driversByRaceNet;
  leagueRef.league = league;
  leagueRef.getDriver = getDriver;
  leagueRef.divisions = league.divisions;

  return leagueRef;
};

const getDriver = name => {
  const upperName = name.toUpperCase();
  let driver = drivers.driversById[upperName];
  if (!driver) {
    driver = drivers.driversByRaceNet[upperName];
    if (!driver) {
      driver = Object.values(drivers.driversByRaceNet).find(driver => {
        return (
          driver.raceNetName.toUpperCase().includes(upperName) ||
          driver.name.toUpperCase().includes(upperName)
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
  return Object.values(drivers.driversById).filter(driver => {
    return (
      driver.division &&
      driver.division.toUpperCase() === division.toUpperCase()
    );
  });
};

const printMissingDrivers = () =>
  debug(`missing drivers: \n${Object.keys(missingDrivers).join("\n")}`);

module.exports = {
  init,
  leagueRef,
  getDriversByDivision,
  printMissingDrivers
};
