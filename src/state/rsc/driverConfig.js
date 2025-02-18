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
  sheetId: "1YjoVOsrZyE8IdDDS3LeZzV_bXkzDi0_683UtalXCxbI",
  tabName: "drivers"
};

module.exports = { driverColumns, sheetsConfig };
