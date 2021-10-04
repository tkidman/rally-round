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

// make sure your racenet DIRT_USERNAME & DIRT_PASSWORD are available on the process.env environment
// set env var DEBUG=tkidman:* to get logs
// run `DEBUG=tkidman:* node fetchOnlyExample.js`
doFetch();
