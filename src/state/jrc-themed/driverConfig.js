const { name, car } = require("../constants/driverFieldNames");

const driverColumns = {
  [name]: "Driver",
  [car]: "Car"
};

const sheetsConfig = {
  sheetId: "1kWouazyd-eLiKmpVdmt8pF1X_A6KjBklzIGimM74Fqo",
  tabName: "Sheet1"
};

module.exports = { driverColumns, sheetsConfig };
