const {
  name,
  raceNetName,
  name3,
  nationality,
  teamId,
  division,
  car
} = require("../constants/driverFieldNames");

const driverColumns = {
  [name]: "Driver",
  [raceNetName]: "Racenet",
  [name3]: "Name 3",
  [teamId]: "Team",
  [division]: "Tier",
  [car]: "Car",
  [nationality]: "Country"
};

const sheetsConfig = {
  sheetId: "1o6DF_4yVSTViMxEHRHxrKF-aFHkbr6y0IMlKefO1IWw",
  tabName: "All tiers"
};

module.exports = { driverColumns, sheetsConfig };
