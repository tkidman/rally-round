const { appendResultsToPreviousEvent } = require("./fetch");
const { recalculateDiffsForEntries } = require("./fetch");
const { init } = require("../state/league");

jest.mock("../api/dirt");

describe("fetch", () => {
  beforeEach(async () => {
    await init();
  });

  it("recalculateDiffs", () => {
    const entries = [
      { totalTime: "05:00.000", stageTime: "04:00.000" },
      { totalTime: "04:12.256", stageTime: "04:12.256" }
    ];
    recalculateDiffsForEntries(entries, "total");
    recalculateDiffsForEntries(entries, "stage");
    expect(entries[0].totalDiff).toEqual("+00:00:47.744");
    expect(entries[1].stageDiff).toEqual("+00:00:12.256");
  });

  describe("appendResultsToPreviousEvent", () => {
    const eventToAppendArray = [
      {
        lastStageId: 2,
        location: "Aus",
        racenetLeaderboardStages: [
          {
            entries: [
              {
                totalTime: "04:00.000",
                stageTime: "04:00.000",
                name: "bobz99"
              },
              {
                totalTime: "01:00.000",
                stageTime: "01:00.000",
                name: "trolli"
              }
            ]
          },
          {
            entries: [
              {
                totalTime: "07:00.000",
                stageTime: "03:00.000",
                name: "bobz99"
              },
              {
                totalTime: "02:00.000",
                stageTime: "01:00.000",
                name: "trolli"
              }
            ]
          }
        ]
      }
    ];

    const mergedEvents = [
      {
        lastStageId: 2,
        location: "Sweden",
        racenetLeaderboardStages: [
          {
            entries: [
              {
                totalTime: "01:00.000",
                stageTime: "01:00.000",
                name: "bobz99"
              }
            ]
          },
          {
            entries: [
              {
                totalTime: "03:00.000",
                stageTime: "02:00.000",
                name: "bobz99"
              }
            ]
          }
        ]
      },
      {
        lastStageId: 2,
        location: "USA",
        racenetLeaderboardStages: [
          {
            entries: [
              {
                totalTime: "02:00.000",
                stageTime: "02:00.000",
                name: "bobz99"
              }
            ]
          },
          {
            entries: [
              {
                totalTime: "08:00.000",
                stageTime: "06:00.000",
                name: "bobz99"
              }
            ]
          }
        ]
      }
    ];

    it("appends results", () => {
      appendResultsToPreviousEvent(eventToAppendArray, mergedEvents, {
        appendToEventIndex: 1
      });
      expect(mergedEvents).toEqual([
        {
          lastStageId: 2,
          location: "Sweden",
          racenetLeaderboardStages: [
            {
              entries: [
                {
                  name: "bobz99",
                  stageTime: "01:00.000",
                  totalTime: "01:00.000"
                }
              ]
            },
            {
              entries: [
                {
                  name: "bobz99",
                  stageTime: "02:00.000",
                  totalTime: "03:00.000"
                }
              ]
            }
          ]
        },
        {
          lastStageId: 2,
          location: "USA",
          racenetLeaderboardStages: [
            {
              entries: [
                {
                  name: "bobz99",
                  stageTime: "02:00.000",
                  totalTime: "02:00.000"
                }
              ]
            },
            {
              entries: [
                {
                  name: "bobz99",
                  stageTime: "06:00.000",
                  totalTime: "08:00.000"
                }
              ]
            },
            {
              entries: [
                {
                  name: "bobz99",
                  stageTime: "04:00.000",
                  totalTime: "00:12:00.000"
                }
              ]
            },
            {
              entries: [
                {
                  name: "bobz99",
                  stageTime: "03:00.000",
                  totalTime: "00:15:00.000"
                }
              ]
            }
          ]
        }
      ]);
    });
  });
});
