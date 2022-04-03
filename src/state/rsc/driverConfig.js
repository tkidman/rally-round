const { name, teamId, car } = require("../constants/driverFieldNames");

const driverColumns = {
  [name]: "Driver",
  [teamId]: "Team",
  [car]: "Car"
};

const sheetsConfig = {
  sheetId: "1rlRzH1P45sZpROE0NF0AylObIusbyVlhP-cWBLB7XUQ",
  tabName: "All tiers"
};

module.exports = { driverColumns, sheetsConfig };
