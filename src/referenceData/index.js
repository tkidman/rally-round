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

const loadDriversFromCSV = () => {
  const csv = fs.readFileSync(
    "../hidden/68-Poland_Overall_Time_28.02.2020.csv-2020-03-01.csv",
    "utf8"
  );
  const rows = Papa.parse(csv, { header: true }).data;
  const driversById = rows.reduce((driversById, row) => {
    const teamId = parseTeam(row);
    const country = parseCountry(row);
    driversById[row.DRIVER] = {
      id: row.DRIVER,
      name: row.DRIVER,
      teamId,
      teamImg: row.TEAM_IMG,
      country,
      countryImg: row.COUNTRY_IMG
    };
    return driversById;
  }, {});
  return driversById;
};

const driversById = loadDriversFromCSV();
const teamsById = keyBy(teams, team => team.id);
const pointsConfig = require("./pointsConfig");

module.exports = { driversById, teamsById, pointsConfig };
