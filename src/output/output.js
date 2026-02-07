const debug = require("debug")("tkidman:rally-round:output");
const fs = require("fs");

const { outputPath, hiddenPath, cachePath } = require("../shared");
const { leagueRef } = require("../state/league");
const copydir = require("copy-dir");
const { upload } = require("../api/aws/s3");
const { writeSheetsForDivision } = require("./spreadsheet");
const { writeAllHTML } = require("./html");
const { writePlacementOutput } = require("./html");

const writeOutputForDivision = async division => {
  await writeSheetsForDivision(division);
};

const writeOutput = async () => {
  debug("begin write output");
  const { league } = leagueRef;

  // Use subfolderName if specified (for multi-club buckets), otherwise upload to root
  const championshipFolder = league.subfolderName || null;

  if (league.placement) {
    writePlacementOutput();
    if (process.env.DIRT_AWS_ACCESS_KEY && league.websiteName) {
      await upload(league.websiteName, championshipFolder);
    }
    debug("only writing placements, returning");
    return true;
  }

  writeAllHTML();

  for (const divisionName of Object.keys(league.divisions)) {
    const division = league.divisions[divisionName];
    await writeOutputForDivision(division);
  }
  if (league.overall) {
    await writeOutputForDivision(league.overall);
  }

  writeJSON(league);
  if (process.env.DIRT_AWS_ACCESS_KEY && league.websiteName) {
    await upload(league.websiteName, championshipFolder);
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
  if (!process.env.KEEP_LOCAL_CACHE) {
    fs.existsSync(cachePath) && fs.rmSync(cachePath, { recursive: true });
  }
  fs.existsSync(cachePath) || fs.mkdirSync(cachePath, { recursive: true });
  fs.existsSync(outputPath) && fs.rmSync(outputPath, { recursive: true });
  fs.mkdirSync(outputPath, { recursive: true });
  fs.mkdirSync(`${outputPath}/website`);
  copydir.sync("./assets", `${outputPath}/website/assets`);
};

module.exports = {
  writeOutput,
  checkOutputDirs
};
