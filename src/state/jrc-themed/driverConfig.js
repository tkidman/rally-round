const driverFieldNames = require("../constants/driverFieldNames");

const driverColumns = {
  ...driverFieldNames,
  [driverFieldNames.name]: "Driver",
  [driverFieldNames.raceNetName]: "Racenet",
  [driverFieldNames.car]: "Car",
  [driverFieldNames.teamId]: "Team"
};

const sheetsConfig = {
  sheetId: "1jWSga3dQV0A_FsdBnNqZzL2k46DKV-jipFj5Fhz0awM",
  tabName: "drivers"
};

module.exports = { driverColumns, sheetsConfig };
