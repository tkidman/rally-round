const driverFieldNames = require("../constants/driverFieldNames");

const driverColumns = {
  ...driverFieldNames,
  [driverFieldNames.name]: "Driver",
  [driverFieldNames.raceNetName]: "Racenet",
  [driverFieldNames.car]: "Car",
  [driverFieldNames.teamId]: "Team"
};

const sheetsConfig = {
  sheetId: "145UUm5YZkMYMtO-5gVUmP_bbfO4QGbXnAOFiSYulp9M",
  tabName: "drivers"
};

module.exports = { driverColumns, sheetsConfig };
