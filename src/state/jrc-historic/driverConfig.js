const driverFieldNames = require("../constants/driverFieldNames");

const driverColumns = {
  ...driverFieldNames,
  [driverFieldNames.name]: "Driver",
  [driverFieldNames.raceNetName]: "Racenet",
  [driverFieldNames.teamId]: "Team"
};

const sheetsConfig = {
  sheetId: "1RkZE9_fEa0nCzAaNmzRXp8x5MeXfCmVOhljLm7s0ca4",
  tabName: "drivers"
};

module.exports = { driverColumns, sheetsConfig };
