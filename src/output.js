const fs = require("fs");
const Papa = require("papaparse");
const lookup = require("country-code-lookup");
const debug = require("debug")("tkidman:dirt2-results:output");

const { outputPath, getDriver } = require("./shared");
const { teamsById } = require("./referenceData");

const countryTemplate =
  '<img src="https://bluelineleague.com/wp-content/uploads/2020/01/%TWO_LETTER_CODE%.png" alt="" width="32" height="32" class="alignnone size-full wp-image-1476" />';

const buildDriverRows = eventResults => {
  const driverRows = eventResults.driverResults.map(result => {
    const driver = getDriver(result.name);
    const country = lookup.byCountry(driver.countryName);
    if (!country) {
      debug(
        `unable to determine country for ${driver.countryName} for driver ${driver.name}`
      );
    }

    const team = teamsById[driver.teamId];
    const driverRow = {};
    driverRow["POS."] = result.rank;
    driverRow.TEAM_IMG = team ? team.teamImg : "";
    driverRow.COUNTRY_IMG = country
      ? countryTemplate.replace("%TWO_LETTER_CODE%", country.iso2.toLowerCase())
      : "";
    driverRow.CLASS = result.leagueName;
    driverRow.DRIVER = driver.id;
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

const writeDriverCSV = (eventResults, leagueName) => {
  const driverRows = buildDriverRows(eventResults, leagueName);
  const driversCSV = Papa.unparse(driverRows);
  fs.writeFileSync(
    `./${outputPath}/${eventResults.location}-${leagueName}-driverResults.csv`,
    driversCSV
  );
};

const writeJSON = eventResults => {
  fs.writeFileSync(
    `./${outputPath}/leagueResults.json`,
    JSON.stringify(eventResults, null, 2)
  );
};

module.exports = { writeJSON, writeDriverCSV, buildDriverRows };
