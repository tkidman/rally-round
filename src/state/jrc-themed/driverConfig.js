const driverFieldNames = require("../constants/driverFieldNames");

const driverColumns = {
  ...driverFieldNames,
  [driverFieldNames.name]: "Driver",
  [driverFieldNames.raceNetName]: "Racenet",
  [driverFieldNames.car]: "Car",
  [driverFieldNames.teamId]: "Team"
};

const sheetsConfig = {
  sheetId: "13h5Lg5New7eaAXTuoyqMhyid3U_HGRjWN5M-0B5_a90",
  tabName: "drivers"
};

module.exports = { driverColumns, sheetsConfig };
