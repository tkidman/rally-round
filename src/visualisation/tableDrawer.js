const debug = require("debug")("tkidman:dirt2-results");
var fs = require("fs");
var Handlebars = require("handlebars");
const folder = "./src/visualisation/";
var counter = 0;
const htmlToImage = require("node-html-to-image");

const countries = JSON.parse(fs.readFileSync("./src/state/constants/countries.json"));
const vehicles = JSON.parse(fs.readFileSync("./src/state/constants/vehicles.json"));
const template_path = `./src/state/${process.env.CLUB}/templates/`;

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
/**
 * @see JRC_MAIN_HELPERS
 */
function processClass(league, clazz){
  const events = league.classes[clazz].events;
  var driverMap = {};
  var teamMap = {};

  events.forEach(event => {
    var location = event.location;
    event.standings.driverStandings.forEach(driver => {
      if(!(driver.name in driverMap)){
        driverMap[driver.name] = { name: driver.name, total: 0 };
      }
      mapEntry = driverMap[driver.name]
      mapEntry[event.location] = driver.totalPoints - mapEntry.total;
      mapEntry.total = driver.totalPoints;
      mapEntry.positionChange = driver.positionChange;
    });

    event.results.driverResults.forEach(result => {
      if(result.name in driverMap){
        var driver = driverMap[result.name];
        if(!driver.team) driver.team = result.teamId;
        if(!driver.car) driver.car = vehicles[result.entry.vehicleName].brand;
        if(!driver.nationality && result.entry.nationality){
          driver.nationality = countries[result.entry.nationality].code;
        } 
      }
    });
  });



  var driverList = Object.values(driverMap);
  driverList.sort((a,b) => b.total - a.total)

  var highest_score = driverList[0].total;
  var counter = 1;
  driverList.forEach(driver => {
    driver.position = counter;
    driver.gap = highest_score - driver.total;
    driver.positive = driver.positionChange > 0;
    driver.neutral = driver.positionChange == 0;
    driver.negative = driver.positionChange < 0;
    if( driver.negative ) driver.positionChange *= -1;
    counter++;
  })

  return {drivers: driverList}
}

/**
 * @see FANTASY_HELPERS
 */
function processFantasyDrivers(driverStandings) {
  var drivers = Object.values(driverStandings);
  var drivers_old = [...drivers];
  drivers.sort((a, b) => b.total - a.total);
  drivers_old.sort((a, b) => b.previous - a.previous);
  const highestScore = drivers[0].total;
  drivers.forEach(driver => (driver.gap = highestScore - driver.total));
  for (let i = 0; i < drivers.length; i++) {
    const driver = drivers[i];
    var prev = drivers_old.findIndex(_d => _d.name == driver.name);
    driver.positive = false;
    driver.neutral = false;
    driver.negative = false;
    driver.rank = i + 1;
    driver.evolution = prev - i;
    if (driver.evolution > 0) {
      driver.positive = true;
    } else if (driver.evolution < 0) {
      driver.negative = true;
      driver.evolution *= -1;
    } else {
      driver.neutral = true;
    }
  }
  return drivers;
}
function processFantasyTeams(teamStandings) {
  var teams = Object.values(teamStandings).reduce((arr, team) => {
    var out = {
      name: team.name,
      points: team.points,
      previous: team.previous,
      positive: false,
      neutral: false,
      negative: false,
      drivers: team.drivers.join(", ")
    };
    Object.keys(team.roster_history).forEach(location => {
      out[location] = team.roster_history[location].points;
    });
    arr.push(out);
    return arr;
  }, []);
  var teams_old = [...teams];
  teams.sort((a, b) => b.points - a.points);
  teams_old.sort((a, b) => b.previous - a.previous);

  const highestScore = teams[0].points;
  teams.forEach(team => (team.gap = highestScore - team.points));

  for (let i = 0; i < teams.length; i++) {
    const team = teams[i];
    var prev = teams_old.findIndex(_t => _t.name == team.name);
    team.rank = i + 1;
    team.evolution = prev - i;
    if (team.evolution > 0) {
      team.positive = true;
    } else if (team.evolution < 0) {
      team.negative = true;
      team.evolution *= -1;
    } else {
      team.neutral = true;
    }
  }

  return teams;
}
function processBestBuy() {
  return [
    {
      name: "TUS Cham",
      value: 8.72,
      cost: 5.5,
      total: 48
    },
    {
      name: "BrothersChris",
      value: 6.66,
      cost: 4.5,
      total: 30
    },
    {
      name: "Wumy73",
      value: 6.3,
      cost: 3,
      total: 19
    },
    {
      name: "Satchmo",
      value: 5.5,
      cost: 2,
      total: 11
    },
    {
      name: "DirtPirate",
      value: 5,
      cost: 5,
      total: 25
    }
  ];
}
function processFantasyResults(results) {
  const drivers = processFantasyDrivers(results.driverStandings);
  const teams = processFantasyTeams(results.teams);
  const bestBuy = processBestBuy();
  return { drivers: drivers, teams: teams, bestBuy: bestBuy };
}

/**
 * @see PROCESSORS
 */
function jrcAllResults(league){
  const data = processClass(league, 'jrc1');

  if (!fs.existsSync(template_path)) return;
  var _t = fs.readFileSync(template_path + "standings.hbs").toString();
  
  var template = Handlebars.compile(_t);
  var out = template(data);

  fs.writeFile(folder + "driverStandings.html", out, function(err) {
    if (err) {
      return debug(`error writing html file`);
    }
  });
} 

const resultsToImage = driverResults => {
  const template_path = `./src/state/${process.env.CLUB}/templates/`;
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

const fantasyStandingsToImage = results => {
  
  if (!fs.existsSync(template_path)) return;
  var _t = fs.readFileSync(template_path + "fantasy.hbs").toString();
  
  var template = Handlebars.compile(_t);
  var data = processFantasyResults(results);
  var out = template(data);
  htmlToImage({
    output: "./fantasy.png",
    html: out
  });
  fs.writeFile(folder + "fantasy.html", out, function(err) {
    if (err) {
      return debug(`error writing html file`);
    }
  });
};

const drawResults = league => {
  if(!league.visualization || !functionMapping[league.visualization]) return;
  functionMapping[league.visualization](league);
}

const functionMapping = {
  "jrc_all": jrcAllResults
}

module.exports = {
  drawResults,
  fantasyStandingsToImage
};
