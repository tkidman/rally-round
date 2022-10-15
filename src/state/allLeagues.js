const fs = require("fs");

const getAllLeagues = () => {
  const leagues = [];
  const files = fs.readdirSync(".");
  files.forEach(file => {
    if (fs.existsSync(`${file}/initialState`)) {
      leagues.push(require(`${file}/initialState`));
    }
  });
  return leagues;
};

const allLeagues = getAllLeagues();

module.exports = { allLeagues };
