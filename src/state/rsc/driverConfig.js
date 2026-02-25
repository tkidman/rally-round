const {
  name,
  teamId,
  car,
  name3,
  country,
  // division
} = require("../constants/driverFieldNames");

const driverColumns = {
  [name]: "Driver",
  [teamId]: "Team",
  [car]: "Car",
  [name3]: "Alt Name",
  [country]: "Country"
  // [division]: "Class"
};

const sheetsConfig = {
  sheetId: "18isiLGfmcQTSBQUSYX8xtrG3rBHyIRwVd5g9U5fo_To",
  tabName: "All tiers"
};

module.exports = { driverColumns, sheetsConfig };
