const { name, teamId, car } = require("../constants/driverFieldNames");

const driverColumns = {
  [name]: "Driver",
  [teamId]: "Team",
  [car]: "Car"
};

const sheetsConfig = {
  sheetId: "1HtXGFM4Ho8w0bd5o5ic4h3P17sWwu2yVYS7zUqhSoUs",
  tabName: "All tiers"
};

module.exports = { driverColumns, sheetsConfig };
