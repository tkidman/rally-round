const driverFieldNames = require("../constants/driverFieldNames");

const driverColumns = {
  ...driverFieldNames,
  [driverFieldNames.name]: "Driver",
  [driverFieldNames.raceNetName]: "Racenet",
  [driverFieldNames.car]: "Car",
  [driverFieldNames.teamId]: "Team"
};

const sheetsConfig = {
  sheetId: "1t4IMjnDjLK7ScluYZdlTa99AUzCRCiThl5sY6FiLL2c",
  tabName: "drivers"
};

module.exports = { driverColumns, sheetsConfig };
