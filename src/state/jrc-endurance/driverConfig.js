const { name, raceNetName } = require("../constants/driverFieldNames");

const driverColumns = {
  [name]: "Gamertag",
  [raceNetName]: "Racenet"
};

const sheetsConfig = {
  sheetId: "155Q1NPyMUSflBoDkdJK3SElq_NEzNaibZNalgcM7NGI",
  tabName: "All tiers"
};

module.exports = { driverColumns, sheetsConfig };
