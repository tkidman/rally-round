const fs = require("fs");
const Papa = require("papaparse");
const debug = require("debug")("tkidman:dirt2-results:output");
const Handlebars = require("handlebars");

const { outputPath, hiddenPath, cachePath, templatePath } = require("./shared");
const { leagueRef } = require("./state/league");
const locations = require("./state/constants/locations.json");
const countries = require("./state/constants/countries.json");
const vehicles = require("./state/constants/vehicles.json");

const buildDriverRows = event => {
  const driverRows = event.results.driverResults.map(result => {
    const driver = leagueRef.getDriver(result.name);
    let team;
    const raceNetName = driver ? driver.raceNetName : "";

    if (driver) {
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

// eslint-disable-next-line no-unused-vars
const writeDriverCSV = (eventResults, divisionName) => {
  const driverRows = buildDriverRows(eventResults, divisionName);
  const driversCSV = Papa.unparse(driverRows);
  fs.writeFileSync(
    `./${outputPath}/${eventResults.location}-${divisionName}-driverResults.csv`,
    driversCSV
  );
};

const addDriverLocationResult = (eventPointsByName, result, event) => {
  if (!eventPointsByName[result.name]) {
    const nationality = countries[result.entry.nationality];
    let nationalityCode;
    if (!nationality) {
      debug(
        `no country found in lookup for ${result.entry.nationality} ${result.name}`
      );
    } else {
      nationalityCode = nationality.code;
    }
    eventPointsByName[result.name] = {
      name: result.name,
      nationality: nationalityCode
    };
  }
  eventPointsByName[result.name][event.location] = result.totalPoints;
};

const addTeamLocationResult = (eventPointsByName, result, event) => {
  if (!eventPointsByName[result.name]) {
    eventPointsByName[result.name] = {
      name: result.name
    };
  }
  eventPointsByName[result.name][event.location] = result.totalPoints;
};

const getStandingCSVRows = (events, type) => {
  const eventPointsByName = events.reduce((eventPointsByName, event) => {
    event.results[`${type}Results`].forEach(result => {
      if (type === "driver") {
        addDriverLocationResult(eventPointsByName, result, event);
      } else {
        addTeamLocationResult(eventPointsByName, result, event);
      }
    });
    return eventPointsByName;
  }, {});
  const lastEvent = events[events.length - 1];
  const standingRows = lastEvent.standings[`${type}Standings`].map(standing => {
    // TODO fix this
    let raceNetName;
    let driverTeam;
    let driverCar;
    if (type === "driver") {
      const driver = leagueRef.getDriver(standing.name);
      raceNetName = driver ? driver.raceNetName : "";
      driverTeam = driver ? driver.teamId : "";
      driverCar = driver ? driver.car : "";
    }

    const standingRow = {
      name: standing.name,
      racenet: raceNetName,
      team: driverTeam,
      car: driverCar,
      ...eventPointsByName[standing.name],
      ...standing
    };
    if (type === "team") {
      delete standingRow.racenet;
      delete standingRow.team;
    }
    return standingRow;
  });
  return standingRows;
};

const transformForHTML = events => {
  const headerLocations = events.reduce((headerLocations, event) => {
    headerLocations.push(locations[event.location].countryCode);
    return headerLocations;
  }, []);

  const lastEvent = events[events.length - 1];
  const rows = lastEvent.standings.driverStandings.map(standing => {
    const currentStanding = standing.currentStanding;
    const movement = {
      positive: currentStanding.positionChange > 0,
      neutral: currentStanding.positionChange === 0,
      negative: currentStanding.positionChange < 0
    };

    const driver = leagueRef.getDriver(currentStanding.name);
    const country = countries[driver.nationality];
    let car = vehicles[driver.car];
    if (!car) {
      car = vehicles[currentStanding.result.entry.vehicleName];
    }
    let carBrand;
    if (!car) {
      debug(`no car found in lookup for ${currentStanding.result.entry.car}`);
    } else {
      carBrand = car.brand;
    }
    return { standing, ...movement, car: carBrand, driver, country };
  });
  return {
    headerLocations,
    rows
  };
};

const writeStandingsHTML = (divisionName, events, type) => {
  if (type === "driver") {
    const data = transformForHTML(events);

    const standingsTemplateFile = `${templatePath}standings.hbs`;
    if (!fs.existsSync(standingsTemplateFile)) {
      debug("no standings html template found, returning");
      return;
    }
    const _t = fs.readFileSync(standingsTemplateFile).toString();

    const template = Handlebars.compile(_t);
    const out = template(data);

    fs.writeFile(`./${outputPath}/driverStandings.html`, out, function(err) {
      if (err) {
        return debug(`error writing html file`);
      }
    });
  }
};

// eslint-disable-next-line no-unused-vars
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

const writeOutput = () => {
  const league = leagueRef.league;
  Object.keys(league.divisions).forEach(divisionName => {
    const divisionEvents = league.divisions[divisionName].events;
    // divisionEvents.forEach(event => {
    //   writeDriverCSV(event, divisionName);
    // });
    // writeStandingsCSV(divisionName, divisionEvents, "driver");
    // writeStandingsCSV(divisionName, divisionEvents, "team");
    writeStandingsHTML(divisionName, divisionEvents, "driver");
  });
  // writeStandingsCSV("overall", league.overall.events, "driver");
  // writeStandingsCSV("overall", league.overall.events, "team");
  writeJSON(league);
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
  writeOutput,
  checkOutputDirs,
  // tests
  getStandingCSVRows,
  buildDriverRows
};
