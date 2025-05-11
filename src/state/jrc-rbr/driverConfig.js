const {
  name,
  teamId,
  car,
  nationality,
  name3,
  team2Id
} = require("../constants/driverFieldNames");

const driverColumns = {
  [name]: "Driver",
  [teamId]: "Team",
  [team2Id]: "Tyre Supplier",
  [car]: "Car",
  [nationality]: "Country",
  [name3]: "Alt Name"
};

const sheetsConfig = {
  sheetId: "1KC5NmAp567yhxKVGni65B1ZO5CUYjXuuyNyvOeMuTsw",
  tabName: "drivers"
};

module.exports = { driverColumns, sheetsConfig };
