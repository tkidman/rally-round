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
  sheetId: "16NMBpzuof5qpctJLhEckplwWj03SAZDDgSC06gpGWkg",
  tabName: "drivers"
};

module.exports = { driverColumns, sheetsConfig };
