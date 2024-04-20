const driverFieldNames = require("../constants/driverFieldNames");

const driverColumns = {
  ...driverFieldNames,
  [driverFieldNames.name]: "Driver",
  [driverFieldNames.raceNetName]: "Racenet",
  [driverFieldNames.teamId]: "Team"
};

const sheetsConfig = {
  sheetId: "1Yz377DA91v87MZnTMl4DE2Pucr13SHcQTCjVLJrMCps",
  tabName: "drivers"
};

module.exports = { driverColumns, sheetsConfig };
