const {
  teamId,
  name,
  division,
  raceNetName,
  car
} = require("../constants/driverFieldNames");

const driverColumns = {
  [name]: "Driver",
  [raceNetName]: "Gamertag",
  [teamId]: "Team",
  [division]: "Tier",
  [car]: "Car"
};

const sheetsConfig = {
  sheetId: "1rpVYNoSlkRwY_r22jRmSDM347dsCgWBL_kwf4015Nkc",
  tabName: "All tiers"
};

module.exports = { driverColumns, sheetsConfig };
