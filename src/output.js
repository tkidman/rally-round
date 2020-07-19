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
    driverRow.DRIVER = result.name;
    driverRow.RACENET = raceNetName;
    driverRow.TEAM = team;
    driverRow.COUNTRY = countryName;
    driverRow.DIVISION = result.divisionName;
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

const writeDriverCSV = (eventResults, divisionName) => {
  const driverRows = buildDriverRows(eventResults, divisionName);
  const driversCSV = Papa.unparse(driverRows);
  fs.writeFileSync(
    `./${outputPath}/${eventResults.location}-${divisionName}-driverResults.csv`,
    driversCSV
  );
};

const getStandingCSVRows = (events, type) => {
  const eventPointsByName = events.reduce((eventPointsByName, event) => {
    event.results[`${type}Results`].forEach(result => {
      if (!eventPointsByName[result.name]) {
        eventPointsByName[result.name] = { name: result.name };
      }
      if (type === "driver") {
        eventPointsByName[result.name][`${event.location}`] =
          result.overallPoints;
        eventPointsByName[result.name][`${event.location}: PS`] =
          result.powerStagePoints;
        eventPointsByName[result.name][`${event.location}: Total`] =
          result.totalPoints;
      } else {
        eventPointsByName[result.name][event.location] = result.totalPoints;
      }
    });
    return eventPointsByName;
  }, {});
  const lastEvent = events[events.length - 1];
  const standingRows = lastEvent.standings[`${type}Standings`].map(standing => {
    let raceNetName;
    if (type === "driver") {
      const driver = getDriver(standing.name);
      raceNetName = driver ? driver.raceNetName : "";
    }

    const standingRow = {
      name: standing.name,
      racenet: raceNetName,
      ...eventPointsByName[standing.name],
      ...standing
    };
    if (type === "team") {
      delete standingRow.racenet;
    }
    return standingRow;
  });
  return standingRows;
};

const writeStandingsCSV = (divisionName, events, type) => {
  const lastEvent = events[events.length - 1];
  const standingRows = getStandingCSVRows(events, type);
  const standingsCSV = Papa.unparse(standingRows);
  fs.writeFileSync(
    `./${outputPath}/${lastEvent.location}-${divisionName}-${type}Standings.csv`,
    standingsCSV
  );

  // name: satchmo, location: points, location: points, name: satchmo, total points: points, position: number,
};

const writeCSV = league => {
  Object.keys(league.divisions).forEach(divisionName => {
    const divisionEvents = league.divisions[divisionName].events;
    divisionEvents.forEach(event => {
      writeDriverCSV(event, divisionName);
    });
    writeStandingsCSV(divisionName, divisionEvents, "driver");
    writeStandingsCSV(divisionName, divisionEvents, "team");
  });
  writeStandingsCSV("overall", league.overall.events, "driver");
  writeStandingsCSV("overall", league.overall.events, "team");
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
  fs.existsSync(cachePath) || fs.mkdirSync(cachePath, { recursive: true });
  fs.existsSync(outputPath) || fs.mkdirSync(outputPath, { recursive: true });
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
