const { keyBy } = require("lodash");
const Papa = require("papaparse");
const fs = require("fs");
const debug = require("debug")("tkidman:dirt2-results:state");

const club = process.env.CLUB || "brl";
const league = require(`./${club}/initialState`);

// const drivers = require("./drivers");
// const driversById = keyBy(drivers, driver => driver.id);

// const parseTeam = row => {
//   const teamImg = row.TEAM_IMG;
//   const dom = new JSDOM(teamImg);
//   const img = dom.window.document.querySelector("img");
//   if (img) {
//     return img.getAttribute("title");
//   } else {
//     debug(`can't find title for img: ${img} for driver ${row.DRIVER}`);
//   }
//   return null;
// };

// const parseCountry = row => {
//   const countryImg = row.COUNTRY_IMG;
//   const dom = new JSDOM(countryImg);
//
//   const img = dom.window.document.querySelector("img");
//   if (img) {
//     const src = img.getAttribute("src");
//     return src.substr(src.length - 6, 2);
//   } else {
//     debug(`can't find country for img: ${img} for driver ${row.DRIVER}`);
//   }
//   return null;
// };

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

const loadDriversFromMasterSheet = () => {
  if (fs.existsSync(`./src/state/${club}/drivers.csv`)) {
    const csv = fs.readFileSync(`./src/state/${club}/drivers.csv`, "utf8");
    const driverColumns = require(`./${club}/driverColumns`);

    const rows = Papa.parse(csv, { header: true }).data;
    const driversById = rows.reduce((driversById, row) => {
      const teamId = row[driverColumns.teamId];
      const countryName = row[driverColumns.countryName];
      const driverName = row[driverColumns.driverName];
      const discordName = row[driverColumns.discordName];
      const raceNetName = row[driverColumns.raceNetName];
      if (driverName) {
        const driverId = driverName.toUpperCase();
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

module.exports = {
  league,
  getDriver
};
