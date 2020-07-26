const {
  teamId,
  name,
  division,
  raceNetName,
  car
} = require("../constants/driverFieldNames");

const driverColumns = {
  //countryName: "Flag",
  [name]: "Gamertag",
  [raceNetName]: "Racenet",
  [teamId]: "Team",
  [division]: "Class",
  [car]: "Car"
};

module.exports = { driverColumns };
