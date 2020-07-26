const { getStandingCSVRows } = require("./output");
const { buildDriverRows } = require("./output");
const { init } = require("./state/league");

describe("output", () => {
  beforeEach(async () => {
    await init();
  });

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

  test("getStandingCSVRows for driver", async () => {
    const league = require("./__fixtures__/preOverallLeague.json");
    expect(
      getStandingCSVRows(league.divisions["pro"].events, "driver")
    ).toEqual([
      {
        Australia: 115,
        "Australia: PS": 5,
        "Australia: Total": 120,
        currentPosition: 1,
        name: "Kuul",
        positionChange: null,
        previousPosition: null,
        racenet: "Kuul",
        totalPoints: 120
      },
      {
        Australia: undefined,
        "Australia: PS": undefined,
        "Australia: Total": 0,
        currentPosition: 28,
        name: "Sladdikurvinen ™",
        positionChange: null,
        previousPosition: null,
        racenet: "Sladdikurvinen",
        totalPoints: 0
      }
    ]);
  });

  test("getStandingCSVRows for team", () => {
    const league = require("./__fixtures__/preOverallLeague.json");
    expect(getStandingCSVRows(league.divisions["pro"].events, "team")).toEqual([
      {
        Australia: 166,
        currentPosition: 1,
        name: "Ditch Dusters",
        positionChange: null,
        previousPosition: null,
        totalPoints: 166
      },
      {
        Australia: 164,
        currentPosition: 2,
        name: "Unlimited Pedal Works",
        positionChange: null,
        previousPosition: null,
        totalPoints: 164
      }
    ]);
  });
});
