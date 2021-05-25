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
  sheetId: "12X740Z5kUKmM0WVWsSVwuSco9-8aKgNU73E_YdHgsks",
  tabName: "All tiers"
};

module.exports = { driverColumns, sheetsConfig };
