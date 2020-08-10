const { name, raceNetName } = require("../constants/driverFieldNames");

const driverColumns = {
  [name]: "Gamertag",
  [raceNetName]: "Racenet"
  // [teamId]: "Themed",
  // [car]: "Themed",
  // [division]: "class"
};

const sheetsConfig = {
  sheetId: "1mLDzhofRL3ZfZts7Zp-1lekLQx6ApFXkhnpEyZdPXZM",
  tabName: "All"
};

module.exports = { driverColumns, sheetsConfig };
