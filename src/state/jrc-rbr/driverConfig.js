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
  sheetId: "1CuC3BlCGNUROl5Sb3pvw9VfaPtOSUKcdiFJMhuV9gTE",
  tabName: "drivers"
};

module.exports = { driverColumns, sheetsConfig };
