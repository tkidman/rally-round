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
  sheetId: "1XLdvxPe9bCZybKWb9nPTCn7kItN-7Xfwtt9LF_KLLNw",
  tabName: "drivers"
};

module.exports = { driverColumns, sheetsConfig };
