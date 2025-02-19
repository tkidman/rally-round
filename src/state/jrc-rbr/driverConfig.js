const {
  name,
  teamId,
  car,
  nationality,
  name3
} = require("../constants/driverFieldNames");

const driverColumns = {
  [name]: "Driver",
  [teamId]: "Team",
  [car]: "Car",
  [nationality]: "Country",
  [name3]: "Alt Name"
};

const sheetsConfig = {
  sheetId: "1YjoVOsrZyE8IdDDS3LeZzV_bXkzDi0_683UtalXCxbI",
  tabName: "drivers"
};

module.exports = { driverColumns, sheetsConfig };
