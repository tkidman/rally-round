
const calculateInternalTeamStandings = (resultsByDriver) => {
	var dictByTeam = Object.values(resultsByDriver).reduce((dict, driver) => {
		var teamId = driver.teamId;
		teamId = teamId ? teamId : "privateer";
		if (!(teamId in dict)) dict[teamId] = [];
		dict[teamId].push(driver);
		return dict;
	}, {})
	Object.keys(dictByTeam).forEach(teamId => {
		var team = dictByTeam[teamId];
		if (teamId == "privateer" || team.size < 2){
			team.forEach(driver => addPointsToResult(driver, 0))
		} else {
			team.sort((a, b) => a.entry.rank - b.entry.rank);
			var score = 5;
			team.forEach(driver => {
				addPointsToResult(driver, score);
				score -= 5;
			});
		}
	})
}

const calculatePowerStagePoints = (resultsByDriver) => {
	Object.values(resultsByDriver).forEach(result => {
		var points = result['powerStagePoints']
		addPointsToResult(result, (points ? points : 0))
	})
}



function addPointsToResult(result, points){
	if (!('fantasyPoints' in result)) result['fantasyPoints'] = 0;
	result['fantasyPoints'] += points;
}

const ACTIVE_CALCULATIONS = [
	calculateInternalTeamStandings,
	calculatePowerStagePoints
]
module.exports = {
	ACTIVE_CALCULATIONS
}