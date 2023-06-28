const driverFieldNames = require("../constants/driverFieldNames");

const driverColumns = {
  ...driverFieldNames,
  [driverFieldNames.name]: "Driver",
  [driverFieldNames.raceNetName]: "Racenet",
  [driverFieldNames.car]: "Car",
  [driverFieldNames.teamId]: "Team"
};

const sheetsConfig = {
  sheetId: "12XKS9069_2sEAEk7jcd-xi5--1epx7v0RjP6B_oYyM8",
  tabName: "drivers"
};

module.exports = { driverColumns, sheetsConfig };
