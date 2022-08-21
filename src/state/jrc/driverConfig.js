const {
  name,
  raceNetName,
  name3,
  nationality
} = require("../constants/driverFieldNames");

const driverColumns = {
  [name]: "Driver",
  [raceNetName]: "Gamertag",
  [name3]: "Name 3",
  // [teamId]: "Team",
  // [division]: "Tier",
  // [car]: "Car",
  [nationality]: "Country"
};

const sheetsConfig = {
  sheetId: "1ygSj1ng306_VBj8vWjebAuFbdHLtjw8SyaAd8SRjyHk",
  tabName: "All tiers"
};

module.exports = { driverColumns, sheetsConfig };
