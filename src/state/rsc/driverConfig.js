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
  sheetId: "141ufqn_FLLh923GYkQnh3PhE-XwpUYP0jNlSy3Ap_RY",
  tabName: "All tiers"
};

module.exports = { driverColumns, sheetsConfig };
