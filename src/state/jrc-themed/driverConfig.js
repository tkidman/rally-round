const driverFieldNames = require("../constants/driverFieldNames");

const driverColumns = {
  ...driverFieldNames,
  [driverFieldNames.name]: "Driver",
  [driverFieldNames.raceNetName]: "Racenet",
  [driverFieldNames.car]: "Car",
  [driverFieldNames.teamId]: "Team"
};

const sheetsConfig = {
  sheetId: "1JtEU3sqXIH-vC_W2O09f2YJURV5XeT7qQV3ClKPhXqY",
  tabName: "drivers"
};

module.exports = { driverColumns, sheetsConfig };
