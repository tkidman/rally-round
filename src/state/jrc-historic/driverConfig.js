const driverFieldNames = require("../constants/driverFieldNames");

const driverColumns = {
  ...driverFieldNames,
  [driverFieldNames.name]: "Driver",
  [driverFieldNames.raceNetName]: "Racenet",
  [driverFieldNames.teamId]: "Team"
};

const sheetsConfig = {
  sheetId: "1U-OG1KY4mmJqAZfpVQpyvKIQw3fQloQR2LaTf0awUGM",
  tabName: "drivers"
};

module.exports = { driverColumns, sheetsConfig };
