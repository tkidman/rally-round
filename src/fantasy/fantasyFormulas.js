const { privateer } = require("../shared");
const calculateInternalTeamStandings = resultsByDriver => {
  var dictByTeam = Object.values(resultsByDriver).reduce((dict, driver) => {
    var teamId = driver.teamId;
    teamId = teamId ? teamId : privateer;
    if (!(teamId in dict)) dict[teamId] = [];
    dict[teamId].push(driver);
    return dict;
  }, {});
  Object.keys(dictByTeam).forEach(teamId => {
    var team = dictByTeam[teamId];
    if (!(teamId === privateer || team.length < 2)) {
      team.sort((a, b) => a.entry.overallPoints - b.entry.overallPoints); //resultsByDriver is already sorted; this sort can probably be skipped
      addPointsToResult(team[0], 3);
    }
  });
};
const calculatePowerStagePoints = resultsByDriver => {
  Object.values(resultsByDriver).forEach(result => {
    var points = result["powerStagePoints"];
    addPointsToResult(result, points ? points : 0);
  });
};

const calculateStandingPoints = resultsByDriver => {
  for (let i = 0; i < 25; i++) {
    if (i == resultsByDriver.length) break;
    var result = resultsByDriver[i];
    if (result.entry.isDnfEntry || result.entry.isDnsEntry) continue;
    addPointsToResult(result, 25 - i);
  }
  // Object.values(resultsByDriver).forEach(result => {
  //   var points = result["overallPoints"];
  //   addPointsToResult(result, points ? points : 0);
  // });
};

const calculateCarPoints = resultsByDriver => {
  Object.values(resultsByDriver).forEach(result => {
    var points = result.entry["vehicleName"] == "SUBARU WRX STI NR4" ? 3 : 0;
    addPointsToResult(result, points);
  });
};

const calculateDNFPoints = resultsByDriver => {
  Object.values(resultsByDriver).forEach(result => {
    var points = result.entry.isDnfEntry || result.entry.isDnsEntry ? -3 : 0;
    addPointsToResult(result, points ? points : 0);
  });
};

const calculatePodiumStreak = (resultsByDriver, previousEvent) => {
  if (!previousEvent) return;
  var previousPodium = previousEvent.results.driverResults
    .slice(0, 3)
    .map(result => result.entry.name);
  for (let i = 0; i < 3; i++) {
    var result = resultsByDriver[i];
    if (previousPodium.includes(result.entry.name))
      addPointsToResult(result, 3);
  }
};
function addPointsToResult(result, points) {
  if (!("fantasyPoints" in result)) result["fantasyPoints"] = 0;
  result["fantasyPoints"] += points;
}

const JRC_CALCULATIONS = [
  calculateInternalTeamStandings,
  calculatePowerStagePoints,
  calculateStandingPoints,
  calculateDNFPoints,
  calculatePodiumStreak,
  calculateCarPoints
];
module.exports = {
  JRC_CALCULATIONS
};
