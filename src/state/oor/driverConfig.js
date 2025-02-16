const driverFieldNames = require("../constants/driverFieldNames");

const driverColumns = {
  ...driverFieldNames,
  [driverFieldNames.name]: "Driver",
  [driverFieldNames.raceNetName]: "Racenet",
  [driverFieldNames.car]: "Car",
  [driverFieldNames.teamId]: "Team"
};

const sheetsConfig = {
  sheetId: "1i_B1oCRfJO5zCUwPgq9NMl28Bk-E_7aj8dUPP7GXbmc",
  tabName: "drivers"
};

module.exports = { driverColumns, sheetsConfig };
