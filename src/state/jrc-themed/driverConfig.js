const driverFieldNames = require("../constants/driverFieldNames");

const driverColumns = {
  ...driverFieldNames,
  [driverFieldNames.name]: "Driver",
  [driverFieldNames.raceNetName]: "Racenet",
  [driverFieldNames.car]: "Car",
  [driverFieldNames.teamId]: "Team"
};

const sheetsConfig = {
  sheetId: "1SWjHt1EYEY-nEw56yoYtmtbhLezfGAB8Jzo0hlbTPp0",
  tabName: "drivers"
};

module.exports = { driverColumns, sheetsConfig };
