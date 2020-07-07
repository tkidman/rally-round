const { getStandingCSVRows } = require("./output");
const { buildDriverRows } = require("./output");

describe("output", () => {
  test("builds driver rows", () => {
    expect(
      buildDriverRows({
        results: {
          driverResults: [
            {
              name: "satchmo",
              entry: {
                totalTime: "04:41:35.987"
              }
            }
          ]
        }
      })
    ).toMatchObject([
      {
        DRIVER: "satchmo",
        TOTAL: "04:41:35.987"
      }
    ]);
  });

  test("getStandingCSVRows", () => {
    const league = require("./__fixtures__/preOverallLeague.json");
    expect(
      getStandingCSVRows("pro", league.classes["pro"].events, "driver")
    ).toEqual([
      {
        Australia: 120,
        currentPosition: 1,
        name: "Kuul",
        racenet: "",
        positionChange: null,
        previousPosition: null,
        totalPoints: 120
      },
      {
        Australia: 0,
        currentPosition: 28,
        name: "Sladdikurvinen ™",
        racenet: "",
        positionChange: null,
        previousPosition: null,
        totalPoints: 0
      }
    ]);
  });
});
