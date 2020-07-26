const {
  teamId,
  name,
  car,
  division,
  raceNetName
} = require("../constants/driverFieldNames");

const driverColumns = {
  [teamId]: "Team",
  [name]: "Username/Gamertag",
  [raceNetName]: "Racenet Display Name",
  [division]: "Class",
  [car]: "Car"
};

module.exports = { driverColumns };
