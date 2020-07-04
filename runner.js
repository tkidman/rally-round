process.env.DEBUG = "tkidman:*";
const { processAllClasses } = require("./src");

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

if (process.argv[2] && process.argv[3]) {
  process.env.DIRT_USERNAME = process.argv[2];
  process.env.DIRT_PASSWORD = process.argv[3];
}
processAllClasses();
