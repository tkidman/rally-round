const driverFieldNames = require("../constants/driverFieldNames");

const driverColumns = {
  ...driverFieldNames,
  [driverFieldNames.name]: "Driver",
  [driverFieldNames.raceNetName]: "Racenet",
  [driverFieldNames.car]: "Car",
  [driverFieldNames.teamId]: "Team"
};

const sheetsConfig = {
  sheetId: "1mFeRAFWrBKaPw2Vwhai_b5wWVUnVnHcUcY6QtkNPaJo",
  tabName: "drivers"
};

module.exports = { driverColumns, sheetsConfig };
