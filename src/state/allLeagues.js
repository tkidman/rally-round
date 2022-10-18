const fs = require("fs");

const getAllLeagues = () => {
  const leagues = [];
  const files = fs.readdirSync("./src/state");
  files.forEach(file => {
    if (fs.existsSync(`./src/state/${file}/initialState.js`)) {
      leagues.push(require(`./${file}/initialState`));
    }
  });
  return leagues;
};

const allLeagues = getAllLeagues();

module.exports = { allLeagues };
