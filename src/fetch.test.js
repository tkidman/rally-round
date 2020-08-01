const { getEventKeysFromRecentResults } = require("./fetch");
const { init } = require("./state/league");

describe("calculates event results", () => {
  beforeEach(async () => {
    await init();
  });

  it("gets event keys from recent results and championships", () => {
    const recentResults = require("./__fixtures__/recentResults.json");
    const championships = require("./__fixtures__/championships.json");
    const eventKeys = getEventKeysFromRecentResults({
      recentResults,
      championships,
      division: {
        championshipIds: ["65933"]
      },
      divisionName: "pro"
    });
    expect(eventKeys).toEqual([
      {
        challengeId: "65933",
        divisionName: "pro",
        eventId: "66384",
        location: "ŁĘCZNA COUNTY",
        stageId: "4",
        eventStatus: "Finished"
      }
    ]);
  });
});
