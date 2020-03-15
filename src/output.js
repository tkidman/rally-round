const fs = require("fs");
const Papa = require("papaparse");
const lookup = require("country-code-lookup");
const debug = require("debug")("tkidman:dirt2-results:output");

const { outputPath } = require("./shared");
const { teamsById, getDriver } = require("./referenceData");

const countryTemplate =
  '<img src="https://bluelineleague.com/wp-content/uploads/2020/01/%TWO_LETTER_CODE%.png" alt="" width="32" height="32" class="alignnone size-full wp-image-1476" />';

const buildDriverRows = event => {
  const driverRows = event.results.driverResults.map(result => {
    const driver = getDriver(result.name);
    let country;
    let team;

    if (driver) {
      country = lookup.byCountry(driver.countryName);
      if (!country) {
        if (driver.countryName === "USA") {
          country = lookup.byCountry("United States");
        }
        if (
          driver.countryName === "England" ||
          driver.countryName === "Scotland"
        ) {
          country = lookup.byCountry("United Kingdom");
        }
        if (!country) {
          debug(
            `unable to determine country for ${driver.countryName} for driver ${driver.name}`
          );
        }
      }
      team = teamsById[driver.teamId];
      if (!team) {
        debug(
          `no team found for driver: ${driver.name} - team id: ${driver.teamId}`
        );
      }
    }

    const driverRow = {};
    driverRow["POS."] = result.rank;
    driverRow.TEAM_IMG = team ? team.teamImg : "";
    driverRow.COUNTRY_IMG = country
      ? countryTemplate.replace("%TWO_LETTER_CODE%", country.iso2.toLowerCase())
      : "";
    driverRow.CLASS = result.className;
    driverRow.DRIVER = result.name;
    driverRow.VEHICLE = result.vehicleName;
    driverRow.TOTAL = result.totalTime;
    driverRow.DIFF = result.totalDiff;
    driverRow.POWER_STAGE_POINTS = result.powerStagePoints;
    driverRow.OVERALL_POINTS = result.overallPoints;
    driverRow.TOTAL_POINTS = result.totalPoints;
    return driverRow;
  });
  return driverRows;
};

const writeDriverCSV = (eventResults, className) => {
  const driverRows = buildDriverRows(eventResults, className);
  const driversCSV = Papa.unparse(driverRows);
  fs.writeFileSync(
    `./${outputPath}/${eventResults.location}-${className}-driverResults.csv`,
    driversCSV
  );
};

const writeCSV = league => {
  Object.keys(league).forEach(className => {
    league[className].forEach(event => {
      writeDriverCSV(event, className);
    });
  });
  return true;
};

const writeJSON = eventResults => {
  fs.writeFileSync(
    `./${outputPath}/leagueResults.json`,
    JSON.stringify(eventResults, null, 2)
  );
};

module.exports = { writeJSON, writeDriverCSV, buildDriverRows, writeCSV };
