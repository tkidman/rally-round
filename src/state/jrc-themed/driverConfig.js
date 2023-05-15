const {
  name,
  // raceNetName,
  // name3
  car,
  teamId
} = require("../constants/driverFieldNames");

const driverColumns = {
  [name]: "Driver",
  // [raceNetName]: "Name2",
  // [name3]: "Name3"
  [car]: "Car",
  [teamId]: "Team"
};

const sheetsConfig = {
  sheetId: "1I8W5-2Nk_C_4lZFiAcLzFln7yGXGhml7j3Tvk-VB7YU",
  tabName: "drivers"
};

module.exports = { driverColumns, sheetsConfig };
