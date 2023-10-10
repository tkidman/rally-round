const {
  name,
  teamId,
  car,
  name3,
  division
} = require("../constants/driverFieldNames");

const driverColumns = {
  [name]: "Driver",
  [teamId]: "Team",
  [car]: "Car",
  [name3]: "Alt Name",
  [division]: "Class"
};

const sheetsConfig = {
  sheetId: "16BMHc9C1y017ILxi8YWZjzYbpMBBFD6GV-PwBwoF4Xc",
  tabName: "All tiers"
};

module.exports = { driverColumns, sheetsConfig };
