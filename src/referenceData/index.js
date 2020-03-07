const { keyBy } = require("lodash");

const drivers = require("./drivers");
const teams = require("./teams");
const pointsConfig = require("./pointsConfig");

const driversById = keyBy(drivers, driver => driver.id);
const teamsById = keyBy(teams, team => team.id);

module.exports = { driversById, teamsById, pointsConfig };
