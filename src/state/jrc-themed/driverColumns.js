const {
  teamId,
  name,
  car,
  division,
  discordName,
  raceNetName
} = require("../constants/driverFieldNames");

const driverColumns = {
  //countryName: "Flag",
  [name]: "Gamertag",
  [discordName]: "Discord",
  [raceNetName]: "Racenet",
  [teamId]: "Themed",
  [car]: "Themed",
  [division]: "class"
};

module.exports = driverColumns;
