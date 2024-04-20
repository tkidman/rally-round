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
  sheetId: "13dSH93-YobmJIZCrO0O_8Mn0-JE4gwY4a9n4VevfeIY",
  tabName: "All tiers"
};

module.exports = { driverColumns, sheetsConfig };
