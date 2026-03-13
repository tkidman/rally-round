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
  sheetId: "1hD1HV5mDAI70wRr0clcpnq3kDz3soNV9BWu55YrVfe8",
  tabName: "drivers"
};

module.exports = { driverColumns, sheetsConfig };
