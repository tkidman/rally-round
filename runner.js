process.env.DEBUG = "tkidman:*";
const { processAllClasses } = require("./src");

if (process.argv[2] && process.argv[3]) {
  process.env.DIRT_USERNAME = process.argv[2];
  process.env.DIRT_PASSWORD = process.argv[3];
}

if (process.argv[4]) {
  process.env.CLUB = process.argv[4];
}
processAllClasses();
