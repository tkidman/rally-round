process.env.DEBUG = "tkidman:*";
const { processAllClasses } = require("./src");

if (process.argv[0] && process.argv[1]) {
  process.env.DIRT_USERNAME = process.argv[2];
  process.env.DIRT_PASSWORD = process.argv[3];
}
processAllClasses();
