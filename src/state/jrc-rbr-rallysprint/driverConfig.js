const {
  name,
  // teamId,
  car,
  nationality,
  name3
} = require("../constants/driverFieldNames");

const driverColumns = {
  [name]: "Driver",
  // [teamId]: "Team",
  [car]: "Car",
  [nationality]: "Country",
  [name3]: "Alt Name"
};

const sheetsConfig = {
  // sheetId: "1jn8N4UQEqdiAr7OzurcCq0Y-VAfjBJPO0i02D3T-2E8",
  // tabName: "All tiers"
};

module.exports = { driverColumns, sheetsConfig };
