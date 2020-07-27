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
        Australia: 120,
        car: "Alpine Renault A110 1600 S",
        currentPosition: 1,
        name: "Kuul",
        nationality: "est",
        positionChange: null,
        previousPosition: null,
        racenet: "Kuul",
        team: "Unlimited Pedal Works",
        totalPoints: 120
      },
      {
        Australia: 0,
        car: "Ford Escort Mk II",
        currentPosition: 28,
        name: "Sladdikurvinen ™",
        nationality: "swe",
        positionChange: null,
        previousPosition: null,
        racenet: "Sladdikurvinen",
        team: "Ditch Dusters",
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
