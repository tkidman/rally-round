const {
  teamId,
  name,
  division,
  discordName,
  raceNetName
} = require("../constants/driverFieldNames");

const driverColumns = {
  //countryName: "Flag",
  [name]: "Gamertag",
  [discordName]: "Discord",
  [raceNetName]: "Racenet",
  [teamId]: "Team",
  [division]: "Class"
};

module.exports = driverColumns;
