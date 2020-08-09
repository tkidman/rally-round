const fs = require("fs");
const Papa = require("papaparse");
const debug = require("debug")("tkidman:dirt2-results:output");
const Handlebars = require("handlebars");

const {
  outputPath,
  hiddenPath,
  cachePath,
  templatePath
} = require("../shared");
const { leagueRef } = require("../state/league");
const locations = require("../state/constants/locations.json");
const countries = require("../state/constants/countries.json");
const vehicles = require("../state/constants/vehicles.json");
const copydir = require("copy-dir");
const { updateResultsSheet } = require("../sheetsAPI/sheets");

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

const transformForHTML = (divisionName, events, type) => {
  const headerLocations = getHeaderLocations(events);
  const lastEvent = events[events.length - 1];
  const rows = lastEvent.standings[`${type}Standings`].map(standing => {
    const movement = {
      positive: standing.positionChange > 0,
      neutral: standing.positionChange === 0,
      negative: standing.positionChange < 0
    };

    const results = getAllResults(standing.name, events, type);
    const row = {
      results,
      standing,
      ...movement
    };
    if (type === "driver") {
      const { driver, country, carBrand } = getDriverData(standing.name);
      return { ...row, car: carBrand, driver, country };
    }
    return row;
  });
  return {
    headerLocations,
    rows,
    showTeam: leagueRef.hasTeams,
    title: divisionName
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

const getTeamStandingData = (standing, events) => {
  const results = getAllResults(standing.name, events, "team");
  const resultsTotalPoints = results.map(result => result.totalPoints);
  return {
    results,
    resultsTotalPoints,
    team: standing.name
  };
};

const getDriverData = driverName => {
  const driver = leagueRef.getDriver(driverName);
  let country = countries[driver.nationality];
  if (!country) {
    debug(`no country found for ${driver.nationality} ${driver.name}`);
    country = countries["eLngRestOfWorld"];
  }
  const car = vehicles[driver.car];
  let carBrand;
  if (!car) {
    if (driver.car) {
      debug(`no car found in lookup for ${driver.car}`);
    }
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
    "Team",
    "Division",
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
      driver.teamId,
      driver.division,
      carBrand,
      ...resultsTotalPoints,
      standing.totalPoints
    ];
    return row;
  });
  const allRows = [header, ...rows];
  return allRows;
};

const transformForTeamStandingsSheets = events => {
  const headerLocations = getHeaderLocations(events);
  const header = ["Pos", "'+/-", "Team", ...headerLocations, "Points"];
  const lastEvent = events[events.length - 1];
  const rows = lastEvent.standings.teamStandings.map(standing => {
    const { resultsTotalPoints, team } = getTeamStandingData(standing, events);
    const row = [
      standing.currentPosition,
      standing.positionChange,
      team,
      ...resultsTotalPoints,
      standing.totalPoints
    ];
    return row;
  });
  const allRows = [header, ...rows];
  return allRows;
};

const writeStandingsSheet = async (division, divisionName) => {
  const standingsSheetId = leagueRef.league.standingsOutputSheetId;
  const driverRows = transformForDriverStandingsSheets(division.events);
  await updateResultsSheet(
    driverRows,
    standingsSheetId,
    `${divisionName} Driver Standings`
  );
  const teamRows = transformForTeamStandingsSheets(division.events);
  await updateResultsSheet(
    teamRows,
    standingsSheetId,
    `${divisionName} Team Standings`
  );
};

const writeStandingsHTML = (divisionName, events, type, links) => {
  const data = transformForHTML(divisionName, events, type);
  data.links = links;
  const standingsTemplateFile = `${templatePath}/${type}Standings.hbs`;
  if (!fs.existsSync(standingsTemplateFile)) {
    debug("no standings html template found, returning");
    return;
  }
  const _t = fs.readFileSync(standingsTemplateFile).toString();

  const template = Handlebars.compile(_t);
  const out = template(data);

  if (divisionName === "overall" && type === "team") {
    fs.writeFileSync(`./${outputPath}/website/index.html`, out);
  }
  fs.writeFileSync(
    `./${outputPath}/website/${divisionName}-${type}-standings.html`,
    out
  );
};

// eslint-disable-next-line no-unused-vars
const writeStandingsCSV = (divisionName, events, type) => {
  const lastEvent = events[events.length - 1];
  const standingRows = transformForDriverStandingsSheets(events);
  const standingsCSV = Papa.unparse(standingRows);
  fs.writeFileSync(
    `./${outputPath}/${lastEvent.location}-${divisionName}-${type}Standings.csv`,
    standingsCSV
  );

  // name: satchmo, location: points, location: points, name: satchmo, total points: points, position: number,
};

const writeSheet = async (division, divisionName) => {
  const disabled = true;
  if (process.env.DIRT_SHEETS_CLIENT_SECRET && !disabled) {
    writeStandingsSheet(division, divisionName);
    for (const event of division.events) {
      await writeDriverResultsSheet(event, division.outputSheetId);
    }
  }
};

const addLinks = (links, name) => {
  links.push(
    {
      link: `${name} team standings`,
      href: `./${name}-team-standings.html`
    },
    {
      link: `${name} driver standings`,
      href: `./${name}-driver-standings.html`
    }
  );
};
const writeOutput = () => {
  const league = leagueRef.league;
  const links = Object.keys(league.divisions).reduce((links, divisionName) => {
    addLinks(links, divisionName);
    return links;
  }, []);
  addLinks(links, "overall");
  Object.keys(league.divisions).forEach(divisionName => {
    const division = league.divisions[divisionName];
    const divisionEvents = division.events;
    writeStandingsHTML(divisionName, divisionEvents, "driver", links);
    writeStandingsHTML(divisionName, divisionEvents, "team", links);
    if (division.outputSheetId) {
      writeSheet(division, divisionName);
    }
  });
  writeStandingsHTML("overall", league.overall.events, "driver", links);
  writeStandingsHTML("overall", league.overall.events, "team", links);
  writeSheet(league.overall, "Overall");
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
  fs.existsSync(`${outputPath}/website`) ||
    fs.mkdirSync(`${outputPath}/website`);
  copydir.sync("./assets", `${outputPath}/website/assets`);
};

module.exports = {
  writeOutput,
  checkOutputDirs,
  // tests
  buildDriverRows
};
