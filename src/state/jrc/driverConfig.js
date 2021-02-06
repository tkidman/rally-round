const {
  teamId,
  name,
  division,
  raceNetName,
  car,
  name3
} = require("../constants/driverFieldNames");

const driverColumns = {
  [name]: "Driver",
  [raceNetName]: "Gamertag",
  [name3]: "Name 3",
  [teamId]: "Team",
  [division]: "Tier",
  [car]: "Car"
};

const sheetsConfig = {
  sheetId: "1DZzbnC_2t0p8SKSyzX-cXhaxJSlxRGKeN3OvF0aEcwY",
  tabName: "All tiers"
};

module.exports = { driverColumns, sheetsConfig };
