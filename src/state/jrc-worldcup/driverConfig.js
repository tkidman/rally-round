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
  sheetId: "1PXw5-84nf_IHU-dOelytyMLEdC6tcxGjNAU3BnsoLDQ",
  tabName: "drivers"
};

module.exports = { driverColumns, sheetsConfig };
