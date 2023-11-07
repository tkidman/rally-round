const driverFieldNames = require("../constants/driverFieldNames");

const driverColumns = {
  ...driverFieldNames,
  [driverFieldNames.name]: "Driver",
  [driverFieldNames.raceNetName]: "Racenet",
  [driverFieldNames.car]: "Car",
  [driverFieldNames.teamId]: "Team"
};

const sheetsConfig = {
  sheetId: "1fZcb7X8U0g0VJe6gS_3y9xaEU0FBuNO4fdHOfvwsvEs",
  tabName: "drivers"
};

module.exports = { driverColumns, sheetsConfig };
