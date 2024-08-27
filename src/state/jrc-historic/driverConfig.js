const driverFieldNames = require("../constants/driverFieldNames");

const driverColumns = {
  ...driverFieldNames,
  [driverFieldNames.name]: "Driver",
  [driverFieldNames.raceNetName]: "Racenet",
  [driverFieldNames.teamId]: "Team"
};

const sheetsConfig = {
  sheetId: "1LkI16EKzYdkLg_3tHvu6aZbOZkwFYpBGJpHie3KreMo",
  tabName: "drivers"
};

module.exports = { driverColumns, sheetsConfig };
