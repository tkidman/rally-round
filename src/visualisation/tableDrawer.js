var fs = require("fs");
var Handlebars = require("handlebars");

const template_path = `./src/state/${process.env.CLUB}/templates/`;

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
      name: "FusionJohn",
      value: 5.53,
      cost: 6.5,
      total: 36
    },
    {
      name: "emuga12",
      value: 5,
      cost: 3,
      total: 15
    },
    {
      name: "Rallymanic1964",
      value: 5,
      cost: 1,
      total: 5
    },
    {
      name: "Satchmo",
      value: 4.86,
      cost: 3.5,
      total: 17
    },
    {
      name: "Babz",
      value: 4.22,
      cost: 4.5,
      total: 19
    }
  ];
}
function processFantasyResults(results) {
  const drivers = processFantasyDrivers(results.driverStandings);
  const teams = processFantasyTeams(results.teams);
  const bestBuy = processBestBuy();
  return { drivers: drivers, teams: teams, bestBuy: bestBuy };
}

const getFantasyHTML = (results, links) => {
  if (!fs.existsSync(template_path)) return;

  var data = processFantasyResults(results);

  var _t = fs.readFileSync(template_path + "fantasy_teams.hbs").toString();
  var team_template = Handlebars.compile(_t);
  var teamlinks = JSON.parse(JSON.stringify(links)); //<-- LOL javascript
  teamlinks["fantasy"].forEach(link => (link.active = link.link == "team"));
  const teamData = {
    teams: data.teams,
    bestBuy: data.bestBuy,
    links: teamlinks
  };

  var _d = fs.readFileSync(template_path + "fantasy_drivers.hbs").toString();
  var driver_template = Handlebars.compile(_d);
  var driverlinks = JSON.parse(JSON.stringify(links)); //<-- LOL javascript
  driverlinks["fantasy"].forEach(link => (link.active = link.link == "driver"));
  const driverData = { drivers: data.drivers, links: driverlinks };

  return [team_template(teamData), driver_template(driverData)];
};

module.exports = {
  getFantasyHTML
};
