const { name, teamId, car, name3 } = require("../constants/driverFieldNames");

const driverColumns = {
  [name]: "Driver",
  [teamId]: "Team",
  [car]: "Car",
  [name3]: "Alt Name"
};

module.exports = { driverColumns };
