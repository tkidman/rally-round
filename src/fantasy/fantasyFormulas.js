const calculateInternalTeamStandings = (resultsByDriver, allDrivers) => {
  var dictByTeam = Object.values(resultsByDriver).reduce((dict, driver) => {
    var teamId = driver.teamId;
    teamId = teamId ? teamId : "privateer";
    if (!(teamId in dict)) dict[teamId] = [];
    dict[teamId].push(driver);
    return dict;
  }, {});
  Object.keys(dictByTeam).forEach(teamId => {
    var team = dictByTeam[teamId];
    if (teamId == "privateer" || team.length < 2) {
      team.forEach(driver => addPointsToResult(driver, 0));
    } else {
      team.sort((a, b) => a.entry.overallPoints - b.entry.overallPoints);
      var score = 5;
      team.forEach(driver => {
        addPointsToResult(driver, score);
        score -= 5;
      });
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
  Object.values(resultsByDriver).forEach(result => {
    var points = result["overallPoints"];
    addPointsToResult(result, points ? points : 0);
  });
};

const calculateDNFPoints = resultsByDriver => {
  Object.values(resultsByDriver).forEach(result => {
    var points = result.entry.isDnfEntry || result.entry.isDnsEntry ? -10 : 1;
    addPointsToResult(result, points ? points : 0);
  });
};

const calculatePodiumStreak = (resultsByDriver, previousEvent) => {
  //TODO:- Podium streak, 10 points
  return;
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
  calculatePodiumStreak
];
module.exports = {
  JRC_CALCULATIONS
};
