require("dotenv").config();
const { fetchEvents } = require("./src/fetch");
const fs = require("fs");
const { checkOutputDirs } = require("./src/output/output");

const doFetch = async () => {
  // will create ./hidden/cache/test dir for cache files
  checkOutputDirs();
  const events = await fetchEvents(
    {
      clubs: [
        {
          // get club id from the club's url
          clubId: "180867",
          // get the starting championship id from the club's championships payload in chrome devtools network tab
          championshipIds: ["504147"],
          includeNextChampionships: true
        }
      ]
    },
    "jrc1",
    // set to true to get results for every stage
    false
  );
  fs.writeFileSync("example.json", JSON.stringify(events, null, 2));
};

// create a file called `.env` containing
// `DIRT_USERNAME="your racenet username / email"`
// `DIRT_PASSWORD="your racenet password"`
// `DEBUG="tkidman:*"`
// run `node fetchOnlyExample.js`
doFetch();
