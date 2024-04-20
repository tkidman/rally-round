const driverFieldNames = require("../constants/driverFieldNames");

const driverColumns = {
  ...driverFieldNames,
  [driverFieldNames.name]: "Driver",
  [driverFieldNames.raceNetName]: "Racenet",
  [driverFieldNames.car]: "Car",
  [driverFieldNames.teamId]: "Team"
};

const sheetsConfig = {
  sheetId: "1Ceke0hRwUkQV5-_VH-D8136aJPlV6IGm15GU4mQco2s",
  tabName: "drivers"
};

module.exports = { driverColumns, sheetsConfig };
