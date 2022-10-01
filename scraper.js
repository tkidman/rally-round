process.env.DEBUG = "tkidman:*";

if (process.argv.length < 3) {
  require("dotenv").config();
}

if (process.argv[2] && process.argv[3]) {
  process.env.DIRT_USERNAME = process.argv[2];
  process.env.DIRT_PASSWORD = process.argv[3];
}

const Papa = require("papaparse");
const { fetchClubs } = require("./src/api/dirt");
// const { updateClubsSheet } = require("./src/api/sheets/sheets");
const fs = require("fs");

const writeCsv = () => {
  const clubs = JSON.parse(fs.readFileSync("./clubs.json", "utf-8"));

  const sortedClubs = clubs.sort((a, b) => b.memberCount - a.memberCount);
  const values = sortedClubs.reduce((acc, club) => {
    acc.push([
      club.name,
      club.memberCount,
      club.clubAccessType === "Moderated",
      club.hasActiveChampionship,
      club.description
    ]);
    return acc;
  }, []);

  const csv = Papa.unparse(values);

  fs.writeFileSync("./clubs.csv", csv);
};

const scrapeClubs = async () => {
  const clubs = await fetchClubs();
  fs.writeFileSync("./clubs.json", JSON.stringify(clubs, null, 2));
  writeCsv();
  // need a valid refresh token why is it so hard :(
  // await updateClubsSheet(clubs);
};

scrapeClubs();
