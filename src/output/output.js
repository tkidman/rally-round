const debug = require("debug")("tkidman:dirt2-results:output");
const fs = require("fs");

const { outputPath, hiddenPath, cachePath } = require("../shared");
const { leagueRef } = require("../state/league");
const copydir = require("copy-dir");
const { writeSheetsForDivision } = require("./spreadsheet");
const { writeHTMLOutputForDivision } = require("./html");
const { writePlacementOutput } = require("./html");
const { writeFantasyHTML } = require("./html");
const { writeHomeHTML } = require("./html");
const { uploadFiles } = require("../api/aws/s3");

const addLinks = (links, name, type) => {
  if (!links[type]) links[type] = [];
  links[type].push({
    link: `${name}`,
    href: `./${name}-${type}-standings.html`,
    active: false
  });
};

const getHtmlLinks = () => {
  const league = leagueRef.league;
  const links = Object.keys(league.divisions).reduce((links, divisionName) => {
    if (leagueRef.hasTeams) addLinks(links, divisionName, "team");
    addLinks(links, divisionName, "driver");
    return links;
  }, {});
  addLinks(links, "overall", "team");
  addLinks(links, "overall", "driver");
  if (league.fantasy) {
    addLinks(links, "team", "fantasy");
    addLinks(links, "driver", "fantasy");
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
      await uploadFiles(`./${outputPath}/website`, league.websiteName);
    }
    debug("only writing placements, returning");
    return true;
  }
  const links = getHtmlLinks();
  writeHomeHTML(links);
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
    await uploadFiles(`./${outputPath}/website`, league.websiteName);
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
  fs.existsSync(outputPath) || fs.mkdirSync(outputPath, { recursive: true });
  fs.existsSync(`${outputPath}/website`) ||
    fs.mkdirSync(`${outputPath}/website`);
  copydir.sync("./assets", `${outputPath}/website/assets`);
};

module.exports = {
  writeOutput,
  checkOutputDirs
};
