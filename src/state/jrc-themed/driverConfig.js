const driverFieldNames = require("../constants/driverFieldNames");

const driverColumns = {
  ...driverFieldNames,
  [driverFieldNames.name]: "Driver",
  [driverFieldNames.raceNetName]: "Racenet",
  [driverFieldNames.car]: "Car",
  [driverFieldNames.teamId]: "Team"
};

const sheetsConfig = {
  sheetId: "1jejMHIabwNExfWIrquUFBXw7DSI0xvOxaFUY-VVDJF8",
  tabName: "drivers"
};

module.exports = { driverColumns, sheetsConfig };
