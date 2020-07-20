const {
  teamId,
  name,
  division,
  discordName,
  raceNetName,
  car
} = require("../constants/driverFieldNames");

const driverColumns = {
  //countryName: "Flag",
  [name]: "Gamertag",
  [discordName]: "Discord",
  [raceNetName]: "Racenet",
  [teamId]: "Team",
  [division]: "Class",
  [car]: "Car"
};

module.exports = driverColumns;
