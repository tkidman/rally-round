const fs = require("fs");
const Papa = require("papaparse");
const lookup = require("country-code-lookup");
const debug = require("debug")("tkidman:dirt2-results:output");

const { outputPath, hiddenPath, cachePath } = require("./shared");
const { getDriver } = require("./state/league");

const buildDriverRows = event => {
  const driverRows = event.results.driverResults.map(result => {
    const driver = getDriver(result.name);
    let country;
    let countryName;
    let team;
    const raceNetName = driver ? driver.raceNetName : "";

    if (driver) {
      countryName = driver.countryName;
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
        // if (!country) {
        //   debug(
        //     `unable to determine country for ${driver.countryName} for driver ${driver.name}`
        //   );
        // }
      }
      team = driver.teamId;
      if (!team) {
        debug(
          `no team found for driver: ${driver.name} - team id: ${driver.teamId}`
        );
      }
    }

    const driverRow = {};
    driverRow["POS."] = result.rank;
    // driverRow.TEAM_IMG = team ? team.teamImg : "";
    // driverRow.COUNTRY_IMG = country
    //   ? countryTemplate.replace("%TWO_LETTER_CODE%", country.iso2.toLowerCase())
    //   : "";
    driverRow.DRIVER = result.name;
    driverRow.RACENET = raceNetName;
    driverRow.TEAM = team;
    driverRow.COUNTRY = countryName;
    driverRow.CLASS = result.className;
    driverRow.VEHICLE = result.entry.vehicleName;
    driverRow.TOTAL = result.entry.totalTime;
    driverRow.DIFF = result.entry.totalDiff;
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

const getStandingCSVRows = (className, events, type) => {
  const allResultsByDriverName = events.reduce((allResultsById, event) => {
    event.results[`${type}Results`].forEach(result => {
      if (!allResultsById[result.name]) {
        allResultsById[result.name] = { name: result.name };
      }
      allResultsById[result.name][event.location] = result.totalPoints;
    });
    return allResultsById;
  }, {});
  const lastEvent = events[events.length - 1];
  const standingRows = lastEvent.standings[`${type}Standings`].map(standing => {
    const driver = getDriver(standing.name);
    const raceNetName = driver ? driver.raceNetName : "";

    return {
      name: standing.name,
      racenet: raceNetName,
      ...allResultsByDriverName[standing.name],
      ...standing
    };
  });
  return standingRows;
};

const writeStandingsCSV = (className, events, type) => {
  const lastEvent = events[events.length - 1];
  const standingRows = getStandingCSVRows(className, events, type);
  const standingsCSV = Papa.unparse(standingRows);
  fs.writeFileSync(
    `./${outputPath}/${lastEvent.location}-${className}-${type}Standings.csv`,
    standingsCSV
  );

  // name: satchmo, location: points, location: points, name: satchmo, total points: points, position: number,
};

const writeCSV = league => {
  Object.keys(league.classes).forEach(className => {
    league.classes[className].events.forEach(event => {
      writeDriverCSV(event, className);
    });
    writeStandingsCSV(className, league.classes[className].events, "driver");
    writeStandingsCSV(className, league.classes[className].events, "team");
  });
  return true;
};

const writeJSON = eventResults => {
  fs.writeFileSync(
    `./${outputPath}/leagueResults.json`,
    JSON.stringify(eventResults, null, 2)
  );
};

const checkOutputDirs = () => {
  fs.existsSync(hiddenPath) || fs.mkdirSync(hiddenPath);
  fs.existsSync(cachePath) || fs.mkdirSync(cachePath);
  fs.existsSync(outputPath) || fs.mkdirSync(outputPath);
};

module.exports = {
  writeJSON,
  writeDriverCSV,
  buildDriverRows,
  writeCSV,
  checkOutputDirs,
  // tests
  getStandingCSVRows
};
