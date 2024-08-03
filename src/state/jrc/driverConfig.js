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
  sheetId: "17yBpSEkx1Elaj61MJwLsxM5FXMHajAWksFfEICScNrQ",
  tabName: "All tiers"
};

module.exports = { driverColumns, sheetsConfig };
