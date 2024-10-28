const driverFieldNames = require("../constants/driverFieldNames");

const driverColumns = {
  ...driverFieldNames,
  [driverFieldNames.name]: "Driver",
  [driverFieldNames.raceNetName]: "Racenet",
  [driverFieldNames.car]: "Car",
  [driverFieldNames.teamId]: "Team"
};

const sheetsConfig = {
  sheetId: "17M7fHBPUbVlceuSWKzsEWUEDe_bDsb1lmQtgKI_UN2M",
  tabName: "drivers"
};

module.exports = { driverColumns, sheetsConfig };
