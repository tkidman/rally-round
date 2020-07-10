const { getDriver, getDriversByClass } = require("../state/league");

function addDnsDrivers(driverResults, clazz) {
  var lookupTable = driverResults.reduce((dict, result) => {
    dict[result.name] = true;
    return dict;
  }, {});
  getDriversByClass(clazz).forEach(driver => {
    if (driver.raceNetName in lookupTable) return;
    driverResults.push({
      className: clazz,
      name: driver.raceNetName,
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

const calculateFantasyStandings = (event, previousEvent, league, clazz) => {
  var teams = league.fantasy.teams;
  if (!league.fantasy) return;
  //if(event.location in teams.points) return;

  var driverResults = event.results.driverResults;
  driverResults.forEach(result => {
    var driver = getDriver(result.name);
    result.teamId = driver ? driver.teamId : undefined;
  });

  addDnsDrivers(driverResults, clazz);

  league.fantasy.calculators.forEach(calculation => calculation(driverResults));

  var lookuptable = driverResults.reduce((dict, driver) => {
    dict[driver.name] = driver.fantasyPoints;
    return dict;
  }, {});

  teams.map(team => {
    if (!(event.location in team.roster_history))
      team.roster_history[event.location] = {
        drivers: team.current_drivers,
        joker: team.joker,
        points: 0
      };
    var _roster = team.roster_history[event.location];
    var score = _roster.drivers.reduce((val, driver) => {
      var driverPoints = lookuptable[driver];
      driverPoints = driverPoints ? driverPoints : -10;
      driverPoints = _roster.joker == driver ? driverPoints * 2 : driverPoints;
      return val + driverPoints;
    }, 0);
    _roster.points = score;
    team.points += score;
  });

  if (!(event.location in league.fantasy.driverStandings)) {
    league.fantasy.driverStandings[event.location] = lookuptable;
  }
  return teams;
};

module.exports = {
  calculateFantasyStandings
};
