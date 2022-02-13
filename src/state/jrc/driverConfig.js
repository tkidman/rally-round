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
  sheetId: "1OI4FMjDhm1kE3Ie4c6p-l23UXj28LSGarBVsNC6B19E",
  tabName: "All tiers"
};

module.exports = { driverColumns, sheetsConfig };
