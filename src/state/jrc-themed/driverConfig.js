const driverFieldNames = require("../constants/driverFieldNames");

const driverColumns = {
  ...driverFieldNames,
  [driverFieldNames.name]: "Driver",
  [driverFieldNames.raceNetName]: "Racenet",
  [driverFieldNames.car]: "Car",
  [driverFieldNames.teamId]: "Team"
};

const sheetsConfig = {
  sheetId: "1I8W5-2Nk_C_4lZFiAcLzFln7yGXGhml7j3Tvk-VB7YU",
  tabName: "drivers"
};

module.exports = { driverColumns, sheetsConfig };
