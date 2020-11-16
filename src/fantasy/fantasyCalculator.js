const { createDNFResult } = require("../shared");
const { getDriversByDivision } = require("../state/league");
let eventList = [];

function addDnsDrivers(driverResults, division) {
  var lookupTable = driverResults.reduce((dict, result) => {
    dict[result.name] = true;
    return dict;
  }, {});
  getDriversByDivision(division).forEach(driver => {
    if (driver.name in lookupTable) return;
    driverResults.push({
      ...createDNFResult(driver.name, true),
      divisionName: division,
      overallPoints: 0,
      powerStagePoints: 0,
      totalPoints: 0,
      fantasyPoints: 0,
      teamId: driver.teamId
    });
  });
}
function removeDoubleCaptains(teams) {
  teams.forEach(team => {
    let captains = [];
    team.roster.forEach(week => {
      if (captains.indexOf(week.captain) > -1) {
        week.captain = "/";
      }
      captains.push(week.captain);
    });
  });
}
function calculateTeamPoints(team, event, lookuptable) {
  team.roster.forEach(week => {
    if (week.location != event.location) return;
    let hasDnf = false;
    var score = week.drivers.reduce((val, driver) => {
      var driverPoints = lookuptable[driver];
      driverPoints = driverPoints ? driverPoints : -3;
      if (driverPoints < 0) hasDnf = true;
      if (week.captain == driver) {
        driverPoints *= 2;
      }
      return val + driverPoints;
    }, 0);
    week.points = score;
    team.previous = team.points;
    team.points += score;
  });
}
function calculateBudget(team, event, previousEvent, prices) {
  if (!previousEvent) {
    team.budget.push(13);
    return;
  } else {
    team.roster.forEach(week => {
      if (week.location != previousEvent.location) return;
      let count = 0;
      week.drivers.forEach(driver => {
        count += parseFloat(prices[driver][event.location]);
      });
      let budget = count < 13 ? 13 : count;
      budget = budget > 20 ? 20 : budget;
      team.budget.push(budget);
      team.value.push(count);
    });
  }
}
function calculateBestBuys(event, lookuptable, fantasy) {
  const driverPrices = fantasy.drivers;
  const loc = event.location;
  let out = [];
  Object.values(driverPrices).forEach(price => {
    out.push({
      name: price.driver,
      cost: price[loc],
      total: lookuptable[price.driver],
      value: (lookuptable[price.driver] / price[loc]).toFixed(3)
    });
  });
  out.sort((a, b) => b.value - a.value);
  fantasy.bestBuy = out.slice(0, 5);
}
function buildDriverStandings(driverStandings, lookuptable, event) {
  Object.keys(lookuptable).forEach(driver => {
    if (!driverStandings[driver]) {
      driverStandings[driver] = {
        name: driver,
        total: 0,
        previous: 0
      };
    }
    driverStandings[driver][event.location] = lookuptable[driver];
    driverStandings[driver].previous = driverStandings[driver].total;
    driverStandings[driver].total += lookuptable[driver];
  });
}
const calculateFantasyStandings = (event, previousEvent, league, division) => {
  if (!league.fantasy) return;
  eventList.push(event.location);
  var teams = league.fantasy.teams;
  teams.forEach(team =>
    calculateBudget(team, event, previousEvent, league.fantasy.drivers)
  );

  if (event.eventStatus == "Active") return teams;

  if (!previousEvent) removeDoubleCaptains(teams); //no need to run this multiple times

  var driverResults = event.results.driverResults;
  addDnsDrivers(driverResults, division);
  league.fantasy.calculators.forEach(calculation =>
    calculation(driverResults, previousEvent)
  );

  var lookuptable = driverResults.reduce((dict, driver) => {
    dict[driver.name] = driver.fantasyPoints;
    return dict;
  }, {});

  teams.forEach(team => calculateTeamPoints(team, event, lookuptable));

  calculateBestBuys(event, lookuptable, league.fantasy);

  if (!league.fantasy.driverStandings) league.fantasy.driverStandings = {};
  buildDriverStandings(league.fantasy.driverStandings, lookuptable, event);

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
    team.budget.forEach((budget, i) => {
      team.roster[i].budget = "฿" + budget;
    });
    var out = {
      name: team.name,
      points: team.points,
      previous: team.previous,
      positive: false,
      neutral: false,
      negative: false,
      drivers: team.manager,
      weekPoints: {},
      budget: Math.max(...team.budget),
      roster: team.roster,
      captains: []
    };
    Object.values(team.roster).forEach(week => {
      let points = week.points ? week.points : "";
      if (week.drivers) {
        var lastRoster = [...week.drivers];
        out.lastRoster = JSON.stringify(lastRoster);
        out.captains.push(week.captain);
      }
      out[week.location] = points;
    });
    out.captains = JSON.stringify(out.captains);
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
function processPriceList(prices) {
  return Object.values(prices).reduce((arr, driver) => {
    let priceArr = [];
    let prev = driver[eventList[0]];
    let notfirst = false;
    eventList.forEach(event => {
      let pr = parseFloat(driver[event]);
      let diff = pr - prev;
      priceArr.push({
        price: pr,
        evolution: diff,
        positive: diff > 0 && notfirst,
        neutral: diff == 0 && notfirst,
        negative: diff < 0 && notfirst
      });
      prev = pr;
      notfirst = true;
    });
    arr.push({
      driver: driver.driver,
      prices: priceArr,
      current: prev
    });
    return arr;
  }, []);
}
function processFantasyResults(results) {
  const drivers = processFantasyDrivers(results.driverStandings);
  const teams = processFantasyTeams(results.teams);
  const bestBuy = results.bestBuy;
  const prices = processPriceList(results.drivers).sort(
    (a, b) => b.current - a.current
  );
  return { drivers: drivers, teams: teams, bestBuy: bestBuy, prices: prices };
}

module.exports = {
  calculateFantasyStandings,
  processFantasyResults
};
