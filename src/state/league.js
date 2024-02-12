const { keyBy, isEmpty, isNil, some } = require("lodash");
const Papa = require("papaparse");
const fs = require("fs");
const debug = require("debug")("tkidman:rally-round:state");
const { club, privateer } = require("../shared");
const league = require(`./${club}/initialState`);
const { driverColumns, sheetsConfig } = require(`./${club}/driverConfig`);
const driverFieldNames = require("./constants/driverFieldNames");
const { loadSheetAndTransform } = require("../api/sheets/sheets");
const vehicles = require("./constants/vehicles.json");
const moment = require("moment");

const missingDrivers = {};
const drivers = {};
const leagueRef = {};

// cars by lowercase name
const carsByName = Object.keys(vehicles).reduce((acc, key) => {
  acc[key.toLowerCase()] = vehicles[key];
  return acc;
}, {});

const carBrands = fs
  .readdirSync("./assets/cars")
  .map(carFile => carFile.split(".")[0]);

const getCarByName = carName => {
  if (!carName) {
    return null;
  }
  const lowerCarName = carName.toLowerCase();
  if (!carsByName[lowerCarName]) {
    const brand = carBrands.find(carBrand =>
      lowerCarName.includes(carBrand.toLowerCase())
    );
    if (!brand) {
      debug(`Unable to find brand for car: ${carName}, setting to unknown`);
    }
    carsByName[lowerCarName] = {
      brand: brand || "unknown",
      class: "unknown"
    };
  }
  return carsByName[lowerCarName];
};

const getField = (row, fieldName) => {
  if (fieldName) {
    const field = row[fieldName] || row[fieldName.toLowerCase()];
    if (!isNil(field)) {
      return field.trim();
    }
  }
  return null;
};

// driver rows is an array of objects of column headers to cell values (ie: [{ racenet: "satchmo", ... }] )
const transformDriverRows = driverRows => {
  const driversById = driverRows.reduce((driversById, row) => {
    const nameValue = getField(row, driverColumns[driverFieldNames.name]);
    if (nameValue && nameValue.trim().length > 0) {
      const driverNameValue = nameValue.trim();
      const id = driverNameValue.toUpperCase();
      let team = null;
      if (league.useCarAsTeam) {
        const carName = getField(row, driverColumns[driverFieldNames.car]);
        const car = vehicles[carName];
        if (!car && carName) {
          debug(`no car found in lookup for ${carName}`);
        } else if (car) {
          team = car.brand;
        }
      } else {
        team = getField(row, driverColumns[driverFieldNames.teamId]);
        if (team && team.toLowerCase() === privateer) {
          team = privateer;
        }
        if (!team || team.trim().length === 0) {
          team = null;
        }
      }
      driversById[id] = {
        id,
        [driverFieldNames.name]: driverNameValue,
        [driverFieldNames.raceNetName]: getField(
          row,
          driverColumns[driverFieldNames.raceNetName]
        ),
        [driverFieldNames.name3]: getField(
          row,
          driverColumns[driverFieldNames.name3]
        ),
        [driverFieldNames.teamId]: team,
        [driverFieldNames.division]: getField(
          row,
          driverColumns[driverFieldNames.division]
        ),
        [driverFieldNames.car]: getField(
          row,
          driverColumns[driverFieldNames.car]
        ),
        [driverFieldNames.nationality]: getField(
          row,
          driverColumns[driverFieldNames.nationality]
        )
      };
    } else {
      debug(
        `Missing driver name in column ${driverColumns[driverFieldNames.name]}`
      );
    }
    return driversById;
  }, {});
  const driversWithRaceNet = Object.values(driversById).filter(
    driver => driver.raceNetName
  );
  const driversByRaceNet = keyBy(driversWithRaceNet, driver =>
    driver.raceNetName.toUpperCase()
  );
  const driversWithName3 = Object.values(driversById).filter(
    driver => driver.name3
  );
  const driversByName3 = keyBy(driversWithName3, driver =>
    driver.name3.toUpperCase()
  );
  return { driversById, driversByRaceNet, driversByName3 };
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
  if (
    sheetsConfig &&
    sheetsConfig.sheetId &&
    process.env.GOOGLE_SHEETS_API_KEY
  ) {
    return loadDriversFromSheets();
  } else if (fs.existsSync(`./src/state/${club}/drivers.csv`)) {
    return loadDriversFromLocalCSV();
  }
  debug("no driver config found, team functionality will not work");
  return { driversById: {}, driversByRaceNet: {}, driversByName3: {} };
};

const loadManualResultsFromSheets = async () => {
  const resultRows = await loadSheetAndTransform({
    sheetId: sheetsConfig.sheetId,
    tabName: sheetsConfig.manualResultsTabName || "Manual Results"
  });
  const manualResults = resultRows.map(row => {
    if (!row["Name"] || !row["Event Number"] || !row["Total Time"]) {
      throw new Error(
        "'Event Number', 'Name' and 'Total Time' are mandatory columns"
      );
    }
    const result = {
      name: row["Name"],
      totalTime: row["Total Time"]
    };
    if (row["PS Time"]) {
      result.stageTime = row["PS Time"];
    }
    if (row["Comment"]) {
      result.extraInfo = row["Comment"];
    }
    return {
      eventIndex: row["Event Number"] - 1,
      results: [result]
    };
  });
  return manualResults;
};

const loadFantasy = async league => {
  if (!league.fantasy) {
    return;
  }
  await loadSheetAndTransform({
    sheetId: league.fantasy.sheetId,
    tabName: "teams"
  }).then(teams => {
    league.fantasy.teams = teams;
    league.fantasy.teams.forEach(team => {
      team.points = 0;
      team.budget = [];
      team.value = [];
      loadSheetAndTransform({
        sheetId: league.fantasy.sheetId,
        tabName: team.name
      }).then(weeks => {
        team.roster = weeks.reduce((roster, week) => {
          roster.push({
            location: week.location,
            captain: week.captain,
            reserve: week.reserve,
            drivers: [week.driver1, week.driver2, week.driver3]
          });
          return roster;
        }, []);
      });
    });
  });

  await loadSheetAndTransform({
    sheetId: league.fantasy.sheetId,
    tabName: "drivers"
  }).then(result => {
    league.fantasy.drivers = result.reduce((out, driver) => {
      out[driver.driver] = driver;
      return out;
    }, {});
  });
};

const init = async () => {
  const { driversById, driversByRaceNet, driversByName3 } = await loadDrivers();
  drivers.driversById = driversById;
  drivers.driversByRaceNet = driversByRaceNet;
  drivers.driversByName3 = driversByName3;
  leagueRef.league = league;
  leagueRef.getDriver = getDriver;
  leagueRef.divisions = league.divisions;
  leagueRef.addDriver = addDriver;
  leagueRef.drivers = drivers;
  leagueRef.getDriverNames = getDriverNames;
  leagueRef.missingDrivers = missingDrivers;
  const teamsFoundOnDrivers = some(Object.values(driversById), "teamId");
  leagueRef.hasTeams =
    teamsFoundOnDrivers ||
    league.useCarAsTeam ||
    league.useCarClassAsTeam ||
    league.useNationalityAsTeam;
  leagueRef.hasCars = !!driverColumns.car;
  leagueRef.includeOverall =
    Object.keys(league.divisions).length > 1 && !league.disableOverall;
  leagueRef.showLivePoints = () => {
    if (league.showLivePoints && leagueRef.endTime) {
      if (league.showLivePointsDaysRemaining) {
        const daysTillEventEnd = moment
          .duration(moment(leagueRef.endTime).diff(moment()))
          .asDays();
        return daysTillEventEnd <= league.showLivePointsDaysRemaining;
      }
      return true;
    }
    return false;
  };

  leagueRef.getBackgroundStyle = () => {
    return (
      league.backgroundStyle ||
      "background-image: linear-gradient(315deg, #ffffff 0%, #d7e1ec 74%); background-size: cover; background-repeat: no-repeat; background-attachment: fixed;"
    );
  };
  await loadFantasy(leagueRef.league);
  if (isEmpty(league.manualResults)) {
    league.manualResults = [];
  }
  try {
    const manualResultsFromSheets = await loadManualResultsFromSheets();
    league.manualResults.push(...manualResultsFromSheets);
  } catch (e) {
    debug(
      `Unable to load manual results from sheets, probably because a tab named 'Manual Results' does not exist - ${e.message}`
    );
  }
  return leagueRef;
};

const addDriver = driver => {
  driver.id = driver.name.toUpperCase();
  drivers.driversById[driver.id] = driver;
};

const getDriver = name => {
  const upperName = name.toUpperCase();
  let driver = drivers.driversById[upperName];
  if (!driver) {
    driver = drivers.driversByRaceNet[upperName];
  }
  if (!driver) {
    driver = drivers.driversByName3[upperName];
  }
  return driver;
};

const getDriverNames = name => {
  const driver = getDriver(name);
  return [
    driver[driverFieldNames.name],
    driver[driverFieldNames.raceNetName],
    driver[driverFieldNames.name3]
  ].filter(name => !!name);
};

const getDriversByDivision = division => {
  return Object.values(drivers.driversById).filter(driver => {
    return (
      driver.division &&
      driver.division.toUpperCase() === division.toUpperCase()
    );
  });
};

const getTeamIds = () => {
  const teamsIds = Object.values(drivers.driversById).reduce(
    (teamIdsObj, driver) => {
      if (driver.teamId && driver.teamId !== privateer) {
        teamIdsObj[driver.teamId] = driver.teamId;
      }
      return teamIdsObj;
    },
    {}
  );
  return Object.keys(teamsIds);
};

const printMissingDrivers = () => {
  debug(`missing drivers:`);
  Object.values(missingDrivers).forEach(driver => {
    debug(`${driver.name} - ${driver.firstCarDriven}`);
  });
};

module.exports = {
  init,
  leagueRef,
  getDriversByDivision,
  getTeamIds,
  printMissingDrivers,
  getCarByName
};
