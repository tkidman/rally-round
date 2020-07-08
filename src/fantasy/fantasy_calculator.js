
const { getDriver } = require("../state/league");
const { ACTIVE_CALCULATIONS } = require("./fantasy_formulas")

const calculateFantasyStandings = (resultsByDriver, previousEvent) => {
	Object.values(resultsByDriver).forEach(result =>  {
		var driver = getDriver(result.name);
		result.teamId = driver ? driver.teamId : undefined;
	})
	
	ACTIVE_CALCULATIONS.forEach(calculation => calculation(resultsByDriver))
	console.log("hey!");
	return;
} 

module.exports = {
	calculateFantasyStandings
}