const driverFieldNames = require("../constants/driverFieldNames");

const driverColumns = {
  ...driverFieldNames,
  [driverFieldNames.name]: "Driver",
  [driverFieldNames.raceNetName]: "Racenet",
  [driverFieldNames.car]: "Car",
  [driverFieldNames.teamId]: "Team"
};

const sheetsConfig = {
  sheetId: "1nNhS64AExvgUQJtEBFShi0bZ0V5zcDzxC3NqWdxKJcc",
  tabName: "drivers"
};

module.exports = { driverColumns, sheetsConfig };
