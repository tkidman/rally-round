const fs = require("fs");
const Papa = require("papaparse");

// const writeDriverCSV = eventResults => {
//   const driverRows = eventResults.driverResults.map(result => {
//     const driver = getDriver(result.name);
//     const driverRow = {};
//     driverRow["POS."] = result.rank;
//     driverRow.TEAM_IMG = driver ? driver.teamImg : "";
//     driverRow.COUNTRY_IMG = driver ? driver.countryImg : "";
//     driverRow.CLASS = "TODO";
//     driverRow.DRIVER = result.name;
//     driverRow.VEHICLE = result.vehicleName;
//     driverRow.TOTAL = result.totalTime;
//     driverRow.DIFF = result.totalDiff;
//     driverRow.POWER_STAGE_POINTS = result.powerStagePoints;
//     driverRow.OVERALL_POINTS = result.overallPoints;
//     driverRow.TOTAL_POINTS = getTotalPoints(result);
//     return driverRow;
//   });
//   const driversCSV = Papa.unparse(driverRows);
//   fs.writeFileSync("./hidden/out/driverResults.csv", driversCSV);
// };

const writeJSON = eventResults => {
  fs.writeFileSync(
    "./hidden/out/leagueResults.json",
    JSON.stringify(eventResults, null, 2)
  );
};

// module.exports = { writeDriverCSV, writeJSON };
module.exports = { writeJSON };
