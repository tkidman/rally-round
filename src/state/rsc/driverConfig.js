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
  sheetId: "1Ew7AWa6W3Vk9yzOeVGXWPL1PjNoUCwx3FW5Pidb7LAU",
  tabName: "All tiers"
};

module.exports = { driverColumns, sheetsConfig };
