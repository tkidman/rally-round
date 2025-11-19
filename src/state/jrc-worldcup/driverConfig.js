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
  [nationality]: "nationality"
};

const sheetsConfig = {
  sheetId: "1kFDKaqPqhSqBTwzat_hJwMCTOjNaZx55ZZksmjRkZWc",
  tabName: "drivers"
};

module.exports = { driverColumns, sheetsConfig };
