const debug = require("debug")("tkidman:dirt2-results:output");
const fs = require("fs");

const { outputPath, hiddenPath, cachePath } = require("../shared");
const { leagueRef } = require("../state/league");
const copydir = require("copy-dir");
const { upload } = require("../api/aws/s3");
const { writeSheetsForDivision } = require("./spreadsheet");
const { writeHTMLOutputForDivision } = require("./html");
const { writePlacementOutput } = require("./html");
const { writeFantasyHTML } = require("./html");
const { writeHomeHTML, writeErrorHTML } = require("./html");

const addLinks = (links, name, type, displayName) => {
  const linkDisplay = displayName || name;
  if (!links[type]) {
    links[type] = [];
  }
  links[type].push({
    name,
    link: `${linkDisplay}`,
    href: `./${name}-${type}-standings.html`,
    active: false
  });
};

const getHtmlLinks = () => {
  const league = leagueRef.league;
  const links = Object.values(league.divisions).reduce((links, division) => {
    const divisionName = division.divisionName;
    const displayName = division.displayName;
    if (leagueRef.hasTeams) {
      addLinks(links, divisionName, "team", displayName);
    }
    addLinks(links, divisionName, "driver", displayName);
    return links;
  }, {});
  if (leagueRef.includeOverall) {
    if (leagueRef.hasTeams) {
      addLinks(links, "overall", "team");
    }
    addLinks(links, "overall", "driver");
  }
  if (league.fantasy) {
    addLinks(links, "team", "fantasy");
    addLinks(links, "driver", "fantasy");
    addLinks(links, "rosters", "fantasy");
  }
  return links;
};

const writeOutputForDivision = async (division, links) => {
  writeHTMLOutputForDivision(division, links);
  await writeSheetsForDivision(division);
};

const writeOutput = async () => {
  debug("begin write output");
  const { league } = leagueRef;

  if (league.placement) {
    writePlacementOutput();
    if (process.env.DIRT_AWS_ACCESS_KEY && league.websiteName) {
      await upload(league.websiteName, league.subfolderName);
    }
    debug("only writing placements, returning");
    return true;
  }
  const links = getHtmlLinks();
  if (!league.subfolderName && !league.useStandingsForHome) {
    writeHomeHTML(links);
    writeErrorHTML(links);
  }
  for (let divisionName of Object.keys(league.divisions)) {
    const division = league.divisions[divisionName];
    await writeOutputForDivision(division, links);
  }
  if (league.overall) {
    await writeOutputForDivision(league.overall, links);
  }
  if (league.fantasy) {
    writeFantasyHTML(league.fantasy, links);
  }
  writeJSON(league);
  if (process.env.DIRT_AWS_ACCESS_KEY && league.websiteName) {
    await upload(league.websiteName, league.subfolderName);
  }
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
  fs.rmdirSync(outputPath, { recursive: true });
  fs.mkdirSync(outputPath, { recursive: true });
  fs.mkdirSync(`${outputPath}/website`);
  copydir.sync("./assets", `${outputPath}/website/assets`);
};

module.exports = {
  writeOutput,
  checkOutputDirs
};
