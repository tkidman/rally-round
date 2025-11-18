const driverFieldNames = require("../constants/driverFieldNames");

const driverColumns = {
  ...driverFieldNames,
  [driverFieldNames.name]: "Driver",
  [driverFieldNames.raceNetName]: "Racenet",
  [driverFieldNames.car]: "Car",
  [driverFieldNames.teamId]: "Team"
};

const sheetsConfig = {
  sheetId: "1NT9zSxGFpLnkVobJoHdQZDkLBlwIKVuc8DHW1CNITEw",
  tabName: "drivers"
};

module.exports = { driverColumns, sheetsConfig };
