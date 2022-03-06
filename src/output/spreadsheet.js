const fs = require("fs");
const Papa = require("papaparse");

const { outputPath } = require("../shared");
const { getTeamStandingData, getLocationCountryCode } = require("./shared");
const { getDriverStandingData } = require("./shared");
const { getHeaderLocationCodes } = require("./shared");
const { getDriverData } = require("./shared");
const { updateResultsSheet } = require("../api/sheets/sheets");
const { leagueRef } = require("../state/league");

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

const isGoogleSheetsEnabled = sheetId => {
  const disabled = true;
  return sheetId && process.env.DIRT_SHEETS_CLIENT_SECRET && !disabled;
};

const writeDriverResultsSheet = async (event, division) => {
  const rows = transformForDriverResultsSheet(event);
  const { countryCode } = getLocationCountryCode(event);

  const { divisionName, outputSheetId } = division;
  if (isGoogleSheetsEnabled(division.outputSheetId)) {
    await updateResultsSheet(rows, outputSheetId, event.location);
  }
  writeCsv(rows, `${countryCode}-${divisionName}-driverResults.csv`);
};

const transformForDriverStandingsSheets = events => {
  const headerLocations = getHeaderLocationCodes(events);
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
  const headerLocations = getHeaderLocationCodes(events);
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

const writeCsv = (rows, filename) => {
  const csv = Papa.unparse(rows);
  fs.writeFileSync(`./${outputPath}/${filename}`, csv);
};

const writeStandingsSheet = async division => {
  const { divisionName } = division;
  const standingsSheetId = leagueRef.league.standingsOutputSheetId;
  const driverRows = transformForDriverStandingsSheets(division.events);
  const teamRows = transformForTeamStandingsSheets(division.events);
  if (isGoogleSheetsEnabled(standingsSheetId)) {
    await updateResultsSheet(
      driverRows,
      standingsSheetId,
      `${divisionName} Driver Standings`
    );
    await updateResultsSheet(
      teamRows,
      standingsSheetId,
      `${divisionName} Team Standings`
    );
  }
  writeCsv(driverRows, `${divisionName}-driverStandings.csv`);
  writeCsv(teamRows, `${divisionName}-teamStandings.csv`);
};

const writeSheetsForDivision = async division => {
  await writeStandingsSheet(division);
  for (const event of division.events) {
    await writeDriverResultsSheet(event, division);
  }
};

module.exports = { writeSheetsForDivision };
