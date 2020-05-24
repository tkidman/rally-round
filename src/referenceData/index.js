const { keyBy } = require("lodash");
const Papa = require("papaparse");
const fs = require("fs");
const { JSDOM } = require("jsdom");
const debug = require("debug")("tkidman:dirt2-results:referenceData");

// const drivers = require("./drivers");
const teams = require("./teams");

// const driversById = keyBy(drivers, driver => driver.id);

const parseTeam = row => {
  const teamImg = row.TEAM_IMG;
  const dom = new JSDOM(teamImg);
  const img = dom.window.document.querySelector("img");
  if (img) {
    return img.getAttribute("title");
  } else {
    debug(`can't find title for img: ${img} for driver ${row.DRIVER}`);
  }
  return null;
};

const parseCountry = row => {
  const countryImg = row.COUNTRY_IMG;
  const dom = new JSDOM(countryImg);

  const img = dom.window.document.querySelector("img");
  if (img) {
    const src = img.getAttribute("src");
    return src.substr(src.length - 6, 2);
  } else {
    debug(`can't find country for img: ${img} for driver ${row.DRIVER}`);
  }
  return null;
};

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
        const message = `unable to find driver: ${name} - reference data sheet needs to be updated.`;
        debug(message);
      }
    }
  }
  return driver;
};

const getTeam = teamCell => {
  if (teamCell) {
    const team = teams.find(
      team => team.teamId.toUpperCase() === teamCell.toUpperCase().trim()
    );
    if (!team) {
      debug(`unable to find team with team name ${teamCell} in teams.json`);
    }
    return team;
  }
  return null;
};

const loadDriversFromMasterSheet = () => {
  const csv = fs.readFileSync("./drivers.csv", "utf8");
  const rows = Papa.parse(csv, { header: true }).data;
  const driversById = rows.reduce((driversById, row) => {
    if (row["0"]) {
      const teamId = row["Team"];
      const countryName = row["Country"];
      const driverName = row["Username/Gamertag on used platform. PC/XBOX/PS4"];
      const discordName = row["Discord Username"];
      const raceNetName =
        row[
          "Racenet Display Name (can be found here https://accounts.codemasters.com/account/update )"
        ];
      const driverId = driverName.toUpperCase();
      if (driverId) {
        driversById[driverId] = {
          id: driverId,
          name: driverName,
          raceNetName,
          discordName,
          teamId,
          countryName
        };
      } else {
        debug(
          `no username found for driver: ${raceNetName}, reference data sheet needs updating`
        );
      }
    }
    return driversById;
  }, {});
  const driversByRaceNet = keyBy(Object.values(driversById), driver =>
    driver.raceNetName.toUpperCase()
  );
  return { driversById, driversByRaceNet };
};

const { driversById, driversByRaceNet } = loadDriversFromMasterSheet();
const teamsById = keyBy(teams, team => team.teamId);
const pointsConfig = require("./pointsConfig");
const { events } = require("./events");

module.exports = {
  driversById,
  teamsById,
  pointsConfig,
  events,
  loadDriversFromMasterSheet,
  getDriver
};
