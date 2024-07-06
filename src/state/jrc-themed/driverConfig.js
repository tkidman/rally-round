const driverFieldNames = require("../constants/driverFieldNames");

const driverColumns = {
  ...driverFieldNames,
  [driverFieldNames.name]: "Driver",
  [driverFieldNames.raceNetName]: "Racenet",
  [driverFieldNames.car]: "Car",
  [driverFieldNames.teamId]: "Team"
};

const sheetsConfig = {
  sheetId: "1hsw3eYM5a4wbbB4yjZPHphA1CFYR-57g2MpLZLx2SKk",
  tabName: "drivers"
};

module.exports = { driverColumns, sheetsConfig };
