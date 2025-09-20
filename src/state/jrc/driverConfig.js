const {
  name,
  raceNetName,
  name3,
  nationality,
  teamId,
  division,
  car
} = require("../constants/driverFieldNames");

const driverColumns = {
  [name]: "Driver",
  [raceNetName]: "Racenet",
  [name3]: "Name 3",
  [teamId]: "Team",
  [division]: "Tier",
  [car]: "Car",
  [nationality]: "Country"
};

const sheetsConfig = {
  sheetId: "1kbVezTd5cDQTL3kIIC29u7RSNfA4cjH1rycFU-1NNFY",
  tabName: "All tiers"
};

module.exports = { driverColumns, sheetsConfig };
