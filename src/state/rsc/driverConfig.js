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
  sheetId: "10iq51x0DNXv3gJsAQ8-WM8AQGOz3YEi5wxuxGikFFw0",
  tabName: "All tiers"
};

module.exports = { driverColumns, sheetsConfig };
