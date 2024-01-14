const driverFieldNames = require("../constants/driverFieldNames");

const driverColumns = {
  ...driverFieldNames,
  [driverFieldNames.name]: "Driver",
  [driverFieldNames.raceNetName]: "Racenet",
  [driverFieldNames.teamId]: "Team"
};

const sheetsConfig = {
  sheetId: "1C77G-vIhHjFAggJHYJsbmB2QjrqeUi3c6chMc60M7qk",
  tabName: "drivers"
};

module.exports = { driverColumns, sheetsConfig };
