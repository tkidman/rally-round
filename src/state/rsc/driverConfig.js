const { name, teamId, car, name3 } = require("../constants/driverFieldNames");

const driverColumns = {
  [name]: "Driver",
  [teamId]: "Team",
  [car]: "Car",
  [name3]: "Alt Name"
};

const sheetsConfig = {
  sheetId: "1kUyNMullXunLlNt88X8uokK_07JHUYRJozMxL9HNLsE",
  tabName: "All tiers"
};

module.exports = { driverColumns, sheetsConfig };
