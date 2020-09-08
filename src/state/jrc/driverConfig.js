const {
  teamId,
  name,
  division,
  raceNetName,
  car
} = require("../constants/driverFieldNames");

const driverColumns = {
  [name]: "Gamertag",
  [raceNetName]: "Racenet",
  [teamId]: "Team",
  [division]: "Tier",
  [car]: "Car"
};

const sheetsConfig = {
  sheetId: "155Q1NPyMUSflBoDkdJK3SElq_NEzNaibZNalgcM7NGI",
  tabName: "All tiers"
};

module.exports = { driverColumns, sheetsConfig };
