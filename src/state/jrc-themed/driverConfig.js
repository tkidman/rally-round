const {
  name,
  car,
  raceNetName,
  name3
} = require("../constants/driverFieldNames");

const driverColumns = {
  [name]: "Driver",
  [car]: "Car",
  [raceNetName]: "Name2",
  [name3]: "Name3"
};

const sheetsConfig = {
  sheetId: "1kWouazyd-eLiKmpVdmt8pF1X_A6KjBklzIGimM74Fqo",
  tabName: "Sheet1"
};

module.exports = { driverColumns, sheetsConfig };
