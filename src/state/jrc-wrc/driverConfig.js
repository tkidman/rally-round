const {
  name,
  teamId,
  car,
  nationality,
  division
} = require("../constants/driverFieldNames");

const driverColumns = {
  [name]: "Driver",
  [teamId]: "Team",
  [car]: "Car",
  [nationality]: "Country",
  [division]: "Tier"
};

const sheetsConfig = {
  sheetId: "15PKaf6DAPOHZERh3Fba75uDxuLFhWjVpXWM31K460BQ",
  tabName: "drivers"
};

module.exports = { driverColumns, sheetsConfig };
