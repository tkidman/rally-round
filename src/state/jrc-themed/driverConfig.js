const driverFieldNames = require("../constants/driverFieldNames");

const driverColumns = {
  ...driverFieldNames,
  [driverFieldNames.name]: "Driver",
  [driverFieldNames.raceNetName]: "Racenet",
  [driverFieldNames.car]: "Car",
  [driverFieldNames.teamId]: "Team"
};

const sheetsConfig = {
  sheetId: "1mt_o9ec5HsaeHaEZGnJQ9n6SsBngwr8tzV1L1suFHsE",
  tabName: "drivers"
};

module.exports = { driverColumns, sheetsConfig };
