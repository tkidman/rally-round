const { buildDriverRows, writeCSV } = require("./output");
const leagueResults = require("../hidden/out/leagueResults.json");

describe("output", () => {
  test("builds driver rows", () => {
    expect(
      buildDriverRows({
        driverResults: [
          {
            name: "satchmo"
          }
        ]
      })
    ).toMatchObject([
      {
        DRIVER: "SATCHMO",
        COUNTRY_IMG:
          '<img src="https://bluelineleague.com/wp-content/uploads/2020/01/au.png" alt="" width="32" height="32" class="alignnone size-full wp-image-1476" />'
      }
    ]);
  });

  test("writes csvs", () => {
    expect(writeCSV(leagueResults)).toBe(true);
  });
});
