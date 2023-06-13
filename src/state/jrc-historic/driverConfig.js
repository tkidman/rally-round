const { name, raceNetName } = require("../constants/driverFieldNames");

const driverColumns = {
  [name]: "Driver",
  [raceNetName]: "Racenet"
};

const sheetsConfig = {
  sheetId: "1y3vvgQsXMjMV1Wf59FF64jIysAcytmkTiUA5LmlFf1c",
  tabName: "drivers"
};

module.exports = { driverColumns, sheetsConfig };
