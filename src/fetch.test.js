const { recalculateDiffsForStage } = require("./fetch");
const {
  getEventKeysFromRecentResults,
  fetchEventsFromKeys
} = require("./fetch");
const { init } = require("./state/league");

const { fetchEventResults } = require("./api/dirt");

jest.mock("./api/dirt");

describe("fetch", () => {
  beforeEach(async () => {
    await init();
  });

  it("gets event keys from recent results and championships", () => {
    const recentResults = require("./__fixtures__/recentResults.json");
    const championships = require("./__fixtures__/championships.json");
    const eventKeys = getEventKeysFromRecentResults({
      recentResults,
      championships,
      division: {},
      divisionName: "pro",
      club: {
        clubId: "123",
        championshipIds: ["65933"]
      }
    });
    expect(eventKeys).toEqual([
      {
        challengeId: "65933",
        divisionName: "pro",
        eventId: "66384",
        location: "ŁĘCZNA COUNTY",
        lastStageId: 4,
        eventStatus: "Finished"
      }
    ]);
  });

  it("fetches events from keys", async () => {
    // aus 1
    fetchEventResults.mockResolvedValueOnce({
      entries: [{ name: "punkly" }, { name: "nonko" }]
    });
    fetchEventResults.mockResolvedValueOnce({
      entries: [{ name: "punkly" }, { name: "nonko" }]
    });
    // swe
    fetchEventResults.mockResolvedValue({
      entries: [{ name: "npiipo" }]
    });
    const events = await fetchEventsFromKeys(
      [
        { location: "Aus", lastStageId: 1 },
        { location: "Swe", lastStageId: 2 }
      ],
      false
    );

    expect(events).toEqual([
      {
        lastStageId: 1,
        location: "Aus",
        racenetLeaderboardStages: [
          {
            entries: [
              {
                name: "punkly"
              },
              {
                name: "nonko"
              }
            ]
          },
          {
            entries: [
              {
                name: "punkly"
              },
              {
                name: "nonko"
              }
            ]
          }
        ]
      },
      {
        lastStageId: 2,
        location: "Swe",
        racenetLeaderboardStages: [
          {
            entries: [
              {
                name: "npiipo"
              }
            ]
          },
          {
            entries: [
              {
                name: "npiipo"
              }
            ]
          }
        ]
      }
    ]);
  });

  it("loads all stages when getAllResults is true", async () => {
    fetchEventResults.mockResolvedValue({
      entries: [{ name: "punkly" }]
    });
    const events = await fetchEventsFromKeys(
      [{ location: "Aus", lastStageId: 2 }],
      true
    );

    expect(events).toEqual([
      {
        lastStageId: 2,
        location: "Aus",
        racenetLeaderboardStages: [
          {
            entries: [
              {
                name: "punkly"
              }
            ]
          },
          {
            entries: [
              {
                name: "punkly"
              }
            ]
          },
          {
            entries: [
              {
                name: "punkly"
              }
            ]
          }
        ]
      }
    ]);
  });

  it("recalculateDiffs", () => {
    const stage = {
      entries: [
        { totalTime: "05:00.000", stageTime: "04:00.000" },
        { totalTime: "04:12.256", stageTime: "04:12.256" }
      ]
    };
    recalculateDiffsForStage(stage, "total");
    recalculateDiffsForStage(stage, "stage");
    expect(stage.entries[0].totalDiff).toEqual("00:00:47:744");
    expect(stage.entries[1].stageDiff).toEqual("00:00:12:256");
  });
});
