const {
  name,
  raceNetName,
  name3
  // car
} = require("../constants/driverFieldNames");

const driverColumns = {
  [name]: "Driver",
  [raceNetName]: "Name2",
  [name3]: "Name3"
  // [car]: "Car"
};

const sheetsConfig = {
  sheetId: "1OI4FMjDhm1kE3Ie4c6p-l23UXj28LSGarBVsNC6B19E",
  tabName: "All tiers"
};

module.exports = { driverColumns, sheetsConfig };
