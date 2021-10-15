const {
  name,
  raceNetName,
  name3,
  nationality
} = require("../constants/driverFieldNames");

const driverColumns = {
  [name]: "Driver",
  [raceNetName]: "Gamertag",
  [name3]: "Name 3",
  [nationality]: "Country"
};

const sheetsConfig = {
  sheetId: "1jN41NMOWcgHMt7erSthKVl-P2HXHEweCIMR83B8tJVs",
  tabName: "All tiers"
};

module.exports = { driverColumns, sheetsConfig };
