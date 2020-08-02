const fs = require("fs");
const Papa = require("papaparse");
const debug = require("debug")("tkidman:dirt2-results:output");
const Handlebars = require("handlebars");

const { outputPath, hiddenPath, cachePath, templatePath } = require("./shared");
const { leagueRef } = require("./state/league");
const locations = require("./state/constants/locations.json");
const countries = require("./state/constants/countries.json");
const vehicles = require("./state/constants/vehicles.json");
const { updateResultsSheet } = require("./sheetsAPI/sheets");

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

const getAllResults = (name, events, type) => {
  return events.map(event =>
    event.results[`${type}Results`].find(result => result.name === name)
  );
};

const getHeaderLocations = events => {
  const headerLocations = events.reduce((headerLocations, event) => {
    headerLocations.push(locations[event.location].countryCode);
    return headerLocations;
  }, []);
  return headerLocations;
};

const transformForHTML = events => {
  const headerLocations = getHeaderLocations(events);
  const lastEvent = events[events.length - 1];
  const rows = lastEvent.standings.driverStandings.map(standing => {
    const movement = {
      positive: standing.positionChange > 0,
      neutral: standing.positionChange === 0,
      negative: standing.positionChange < 0
    };

    const results = getAllResults(standing.name, events, "driver");
    const driver = leagueRef.getDriver(standing.name);
    const country = countries[driver.nationality];
    const car = vehicles[driver.car];
    let carBrand;
    if (!car) {
      debug(`no car found in lookup for ${driver.car}`);
    } else {
      carBrand = car.brand;
    }
    return { results, standing, ...movement, car: carBrand, driver, country };
  });
  return {
    headerLocations,
    rows
  };
};

const getDriverStandingData = (standing, events) => {
  const results = getAllResults(standing.name, events, "driver");
  const resultsTotalPoints = results.map(result => result.totalPoints);
  return {
    results,
    resultsTotalPoints,
    ...getDriverData(standing.name)
  };
};

const getDriverData = driverName => {
  const driver = leagueRef.getDriver(driverName);
  const country = countries[driver.nationality];
  const car = vehicles[driver.car];
  let carBrand;
  if (!car) {
    debug(`no car found in lookup for ${driver.car}`);
  } else {
    carBrand = car.brand;
  }
  return {
    driver,
    country,
    car,
    carBrand
  };
};

const transformForDriverResultsSheet = event => {
  const header = [
    "Pos",
    "Nat",
    "Driver",
    "Car",
    "Team",
    "DNF?",
    "Total",
    "Diff",
    "PS",
    "PS Diff",
    "Points",
    "PS Points",
    "Total Points"
  ];
  const rows = event.results.driverResults.map((result, index) => {
    const { driver, country, carBrand } = getDriverData(result.name);
    let dnf = "";
    if (result.entry.disqualificationReason) {
      dnf = "DQ";
    } else if (result.entry.isDnsEntry) {
      dnf = "DNS";
    } else if (result.entry.isDnfEntry) {
      dnf = "DNF";
    }
    const row = [
      index + 1,
      country.code,
      result.name,
      carBrand,
      driver.team,
      dnf,
      `'${result.entry.totalTime}`,
      `'${result.entry.totalDiff}`,
      `'${result.entry.stageTime}`,
      `'${result.entry.stageDiff}`,
      result.overallPoints,
      result.powerStagePoints,
      result.totalPoints
    ];
    return row;
  });
  return [header, ...rows];
};

const writeDriverResultsSheet = async (event, sheetId) => {
  const rows = transformForDriverResultsSheet(event);
  await updateResultsSheet(rows, sheetId, event.location);
};

const transformForDriverStandingsSheets = events => {
  const headerLocations = getHeaderLocations(events);
  const header = [
    "Pos",
    "'+/-",
    "Nat",
    "Driver",
    "Car",
    ...headerLocations,
    "Points"
  ];
  const lastEvent = events[events.length - 1];
  const rows = lastEvent.standings.driverStandings.map(standing => {
    const {
      resultsTotalPoints,
      driver,
      country,
      carBrand
    } = getDriverStandingData(standing, events);
    const row = [
      standing.currentPosition,
      standing.positionChange,
      country.code,
      driver.name,
      carBrand,
      ...resultsTotalPoints,
      standing.totalPoints
    ];
    return row;
  });
  const allRows = [header, ...rows];
  return allRows;
};

const writeStandingsSheet = async division => {
  const rows = transformForDriverStandingsSheets(division.events);
  await updateResultsSheet(rows, division.outputSheetId, "Driver Standings");
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

const writeSheet = async division => {
  writeStandingsSheet(division);
  for (const event of division.events) {
    await writeDriverResultsSheet(event, division.outputSheetId);
  }
};
const writeOutput = () => {
  const league = leagueRef.league;
  Object.keys(league.divisions).forEach(divisionName => {
    const division = league.divisions[divisionName];
    const divisionEvents = division.events;
    // divisionEvents.forEach(event => {
    //   writeDriverCSV(event, divisionName);
    // });
    // writeStandingsCSV(divisionName, divisionEvents, "driver");
    // writeStandingsCSV(divisionName, divisionEvents, "team");
    writeStandingsHTML(divisionName, divisionEvents, "driver");
    if (division.outputSheetId) {
      writeSheet(division);
    }
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
