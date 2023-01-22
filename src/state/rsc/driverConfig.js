const {
  name,
  teamId,
  car,
  name3
  // division
} = require("../constants/driverFieldNames");

const driverColumns = {
  [name]: "Driver",
  [teamId]: "Team",
  [car]: "Car",
  [name3]: "Alt Name"
  // [division]: "Class"
};

const sheetsConfig = {
  sheetId: "1p-_aHzD4ZHG7w7APfjQxJSKEK2lR67b0Zao7YQfbJYA",
  tabName: "All tiers"
};

module.exports = { driverColumns, sheetsConfig };
