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
  sheetId: "1IpbqdDUJCijNzeRM9lsqP1jwutbVug1JdZ-LH8tQM9M",
  tabName: "drivers"
};

module.exports = { driverColumns, sheetsConfig };
