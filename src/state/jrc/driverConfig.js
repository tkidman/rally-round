const {
  teamId,
  name,
  division,
  raceNetName,
  car,
  name3,
  nationality
} = require("../constants/driverFieldNames");

const driverColumns = {
  [name]: "Driver",
  [raceNetName]: "Gamertag",
  [name3]: "Name 3",
  [teamId]: "Team",
  [division]: "Tier",
  [car]: "Car",
  [nationality]: "Country"
};

const sheetsConfig = {
  sheetId: "1GMrePeMDSVYs-lNojColY0ph0mHW6QQIxvxogysreVY",
  tabName: "All tiers"
};

module.exports = { driverColumns, sheetsConfig };
