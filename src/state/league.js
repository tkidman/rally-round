const { keyBy } = require("lodash");
const Papa = require("papaparse");
const fs = require("fs");
const debug = require("debug")("tkidman:dirt2-results:state");
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

// driver rows is an array of objects of column headers to cell values (ie: [{ racenet: "satchmo", ... }] )
const transformDriverRows = driverRows => {
  const driversById = driverRows.reduce((driversById, row) => {
    const nameValue = row[driverColumns[driverFieldNames.name]];
    if (nameValue) {
      const driverNameValue = nameValue.trim();
      const id = driverNameValue.toUpperCase();
      let team = null;
      if (league.useCarAsTeam) {
        const carName = row[driverColumns[driverFieldNames.car]];
        const car = vehicles[carName];
        if (!car && carName) {
          debug(`no car found in lookup for ${carName}`);
        } else if (car) {
          team = car.brand;
        }
      } else {
        team = row[driverColumns[driverFieldNames.teamId]];
      }
      driversById[id] = {
        id,
        [driverFieldNames.name]: driverNameValue,
        [driverFieldNames.raceNetName]:
          row[driverColumns[driverFieldNames.raceNetName]],
        [driverFieldNames.name3]: row[driverColumns[driverFieldNames.name3]],
        [driverFieldNames.teamId]: team,
        [driverFieldNames.division]:
          row[driverColumns[driverFieldNames.division]],
        [driverFieldNames.car]: row[driverColumns[driverFieldNames.car]],
        [driverFieldNames.nationality]:
          row[driverColumns[driverFieldNames.nationality]]
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
  leagueRef.hasTeams =
    !!driverColumns.teamId ||
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

  await loadFantasy(leagueRef.league);
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
  const teamIdsObj = keyBy(drivers.driversById, driver => driver.teamId);
  delete teamIdsObj[privateer];
  return Object.keys(teamIdsObj);
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
  printMissingDrivers
};
