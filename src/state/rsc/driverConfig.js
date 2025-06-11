const {
  name,
  // teamId,
  // car,
  name3
  // division
} = require("../constants/driverFieldNames");

const driverColumns = {
  [name]: "Driver",
  // [teamId]: "Team",
  // [car]: "Car",
  [name3]: "Alt Name"
  // [division]: "Class"
};

const sheetsConfig = {
  sheetId: "1b5cr9wi4ZByM86bepyWAAqhFjYwP3Y2CsEJx1lyYXD4",
  tabName: "All tiers"
};

module.exports = { driverColumns, sheetsConfig };
