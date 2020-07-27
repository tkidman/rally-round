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

const sheetsConfig = {
  sheetId: "1mLDzhofRL3ZfZts7Zp-1lekLQx6ApFXkhnpEyZdPXZM",
  tabName: "All"
};

module.exports = { driverColumns, sheetsConfig };
