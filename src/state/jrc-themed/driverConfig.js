const {
  name,
  raceNetName,
  teamId,
  car
} = require("../constants/driverFieldNames");

const driverColumns = {
  [name]: "Gamertag",
  [raceNetName]: "Racenet",
  [teamId]: "Themed",
  [car]: "Themed"
};

const sheetsConfig = {
  sheetId: "155Q1NPyMUSflBoDkdJK3SElq_NEzNaibZNalgcM7NGI",
  tabName: "All tiers"
};

module.exports = { driverColumns, sheetsConfig };
