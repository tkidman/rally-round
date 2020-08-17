const { getDriversByDivision } = require("../state/league");
const debug = require("debug")("tkidman:dirt2-results:fantasy");

function addDnsDrivers(driverResults, division) {
  var lookupTable = driverResults.reduce((dict, result) => {
    dict[result.name] = true;
    return dict;
  }, {});
  getDriversByDivision(division).forEach(driver => {
    if (driver.name in lookupTable) return;
    driverResults.push({
      divisionName: division,
      name: driver.name,
      overallPoints: 0,
      powerStagePoints: 0,
      totalPoints: 0,
      fantasyPoints: 0,
      teamId: driver.teamId,
      entry: {
        isDnfEntry: true,
        isDnsEntry: true,
        name: driver.name,
        totalTime: "99:99:99.999"
      }
    });
  });
}
const calculateFantasyStandings = (event, previousEvent, league, division) => {
  var teams = league.fantasy.teams;
  if (!league.fantasy) return;
  //if(event.location in teams.points) return;

  var driverResults = event.results.driverResults;

  addDnsDrivers(driverResults, division);

  league.fantasy.calculators.forEach(calculation =>
    calculation(driverResults, previousEvent)
  );

  var lookuptable = driverResults.reduce((dict, driver) => {
    dict[driver.name] = driver.fantasyPoints;
    return dict;
  }, {});

  teams.map(team => {
    if (!(event.location in team.roster_history))
      team.roster_history[event.location] = {
        drivers: team.drivers,
        joker: team.joker,
        points: 0
      };
    var _roster = team.roster_history[event.location];
    var score = _roster.drivers.reduce((val, driver) => {
      var driverPoints = lookuptable[driver];
      driverPoints = driverPoints ? driverPoints : -10;
      if (_roster.inactive) {
        driverPoints = Math.round(driverPoints * 0.75);
        //driverPoints = (driverPoints < 0) ? 0 : driverPoints;
      } else if (_roster.joker == driver) {
        driverPoints *= 2;
      }
      return val + driverPoints;
    }, 0);
    _roster.points = score;
    team.previous = team.points;
    team.points += score;
  });

  if (!league.fantasy.driverStandings) league.fantasy.driverStandings = {};
  Object.keys(lookuptable).forEach(driver => {
    if (!league.fantasy.driverStandings[driver]) {
      league.fantasy.driverStandings[driver] = {
        name: driver,
        total: 0,
        previous: 0
      };
    }
    league.fantasy.driverStandings[driver][event.location] =
      lookuptable[driver];
    league.fantasy.driverStandings[driver].previous =
      league.fantasy.driverStandings[driver].total;
    league.fantasy.driverStandings[driver].total += lookuptable[driver];
  });
  // if (!(event.location in league.fantasy.driverStandings)) {
  //   league.fantasy.driverStandings[event.location] = lookuptable;
  // }
  var fs = require("fs");
  fs.writeFile(
    "./src/state/jrc/new_fantasyTeams.json",
    JSON.stringify(teams),
    function(err) {
      if (err) {
        return debug(`error writing fantasyJson file`);
      }
    }
  );
  return teams;
};

/**
 * RENDERER HELPERS
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
      name: "Pynklu",
      value: 210,
      cost: 0.1,
      total: 21
    },
    {
      name: "Raumo",
      value: 6.22,
      cost: 4.5,
      total: 28
    },
    {
      name: "BrothersChris",
      value: 5.23,
      cost: 6.5,
      total: 34
    },
    {
      name: "Satchmo",
      value: 4.75,
      cost: 4,
      total: 19
    },
    {
      name: "TUS Cham",
      value: 4.75,
      cost: 8,
      total: 38
    }
  ];
}
function processFantasyResults(results) {
  const drivers = processFantasyDrivers(results.driverStandings);
  const teams = processFantasyTeams(results.teams);
  const bestBuy = processBestBuy();
  return { drivers: drivers, teams: teams, bestBuy: bestBuy };
}

module.exports = {
  calculateFantasyStandings,
  processFantasyResults
};
