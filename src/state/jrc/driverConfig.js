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
  [raceNetName]: "Gamertag",
  [name3]: "Name 3",
  [teamId]: "Team",
  [division]: "Tier",
  [car]: "Car",
  [nationality]: "Country"
};

const sheetsConfig = {
  sheetId: "1-OlAYY2yT4aQETGPZyJta3r3YziRL19fqL0xNRSk_JE",
  tabName: "All tiers"
};

module.exports = { driverColumns, sheetsConfig };
