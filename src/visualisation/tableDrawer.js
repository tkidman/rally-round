const debug = require("debug")("tkidman:dirt2-results");
var fs = require("fs");
var Handlebars = require("handlebars");
const folder = "./src/visualisation/";
var counter = 0;
const htmlToImage = require("node-html-to-image");

function processDriverResults(results) {
  let rawdata = fs.readFileSync("./src/state/constants/countries.json");
  let countries = JSON.parse(rawdata);
  var driversArray = Object.values(results).filter(result => result.entry.rank);
  driversArray = driversArray.map(result => {
    var nationality = countries[result.entry.nationality];
    if (!nationality) {
      debug(`Missing nationality ${result.entry.nationality}`);
    }
    return {
      rank: result.entry.rank,
      nationality: nationality["code"],
      name: result.name,
      team: result.teamId,
      vehicle: result.entry.vehicleName,
      time: result.entry.totalTime,
      diff: result.entry.totalDiff,
      points: result.overallPoints,
      powerstage: result.powerStagePoints,
      total: result.totalPoints
    };
  });
  driversArray.sort((a, b) => b.total - a.total);
  return {
    columns: [
      "",
      "nationality",
      "driver",
      "team",
      "vehicle",
      "time",
      "diff",
      "points",
      "Power Stage",
      "Total"
    ],
    drivers: driversArray
  };
}

const resultsToImage = driverResults => {
  //const template_path = `./src/state/${process.env.CLUB}/templates/`
  const template_path = `./src/state/jrc/templates/`;
  if (!fs.existsSync(template_path) || counter > 1) return;
  var _t = fs.readFileSync(template_path + "week_result.hbs").toString();
  var template = Handlebars.compile(_t);
  var data = processDriverResults(driverResults);
  var out = template(data);
  counter++;

  htmlToImage({
    output: "./image.png",
    html: out
  });
  fs.writeFile(folder + counter + "test.html", out, function(err) {
    if (err) {
      return debug(`error writing html file`);
    }
  });
};

module.exports = {
  resultsToImage
};
