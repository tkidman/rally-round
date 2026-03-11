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
  sheetId: "18tnNj6EaEffFM7Vy9zN838yGy4JiM3dEOXi0B3SgWeU",
  tabName: "All tiers"
};

module.exports = { driverColumns, sheetsConfig };
