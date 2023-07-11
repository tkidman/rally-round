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
  sheetId: "1-YsLxSqYdqmYp70bww4y0ucVOBH0bPTua0aR76S7wZI",
  tabName: "All tiers"
};

module.exports = { driverColumns, sheetsConfig };
