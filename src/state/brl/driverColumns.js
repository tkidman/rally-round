const {
  teamId,
  name,
  countryName,
  car,
  division,
  discordName,
  raceNetName
} = require("../constants/driverFieldNames");

const driverColumns = {
  [teamId]: "Team",
  [countryName]: "Country",
  [name]: "Username/Gamertag",
  [discordName]: "Discord Username",
  [raceNetName]: "Racenet Display Name",
  [division]: "Class",
  [car]: "Car"
};

module.exports = driverColumns;
