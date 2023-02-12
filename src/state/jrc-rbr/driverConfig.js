const {
  name,
  teamId,
  car,
  nationality,
  name3
} = require("../constants/driverFieldNames");

const driverColumns = {
  [name]: "Driver",
  [teamId]: "Team",
  [car]: "Car",
  [nationality]: "Country",
  [name3]: "Alt Name"
};

const sheetsConfig = {
  sheetId: "1KDaRVaua6O626KpIm_qQ4EVpke3anNb7qluujL1eAI8",
  tabName: "drivers"
};

module.exports = { driverColumns, sheetsConfig };
