const {
  calculateEventResults,
  sortTeamResults,
  calculateEventStandings,
  calculateOverall
} = require("./index");
const leaderboard = require("./__fixtures__/leaderboard");
const { getEventKeysFromRecentResults } = require("./index");

describe("calculates event results", () => {
  test("returns results for drivers", () => {
    const expected = [
      {
        className: "pro",
        name: "Spookex *-*",
        overallPoints: 10,
        powerStagePoints: 4,
        totalPoints: 14,
        entry: {
          totalTime: "04:41:35.987"
        }
      },
      {
        className: "pro",
        name: "SFRrallimoilane",
        overallPoints: 9,
        powerStagePoints: 5,
        totalPoints: 14,
        entry: {
          totalTime: "05:00:00.000"
        }
      }
    ];
    expect(
      calculateEventResults(leaderboard, null, "pro").driverResults
    ).toMatchObject(expected);
  });

  test("returns results for teams", () => {
    const expected = [
      {
        className: "pro",
        name: "Time Penalty Boys",
        totalPoints: 19
      }
    ];
    expect(calculateEventResults(leaderboard, null, "pro").teamResults).toEqual(
      expected
    );
  });

  test("sorts team results by points", () => {
    const teamResultsById = {
      team1: {
        totalPoints: 10
      },
      team2: {
        totalPoints: 5
      },
      team3: {
        totalPoints: 15
      }
    };
    expect(sortTeamResults(teamResultsById)).toEqual([
      {
        totalPoints: 15
      },
      {
        totalPoints: 10
      },
      {
        totalPoints: 5
      }
    ]);
  });

  test("calculates standings with previous standings", () => {
    const event = {
      results: {
        driverResults: [
          {
            name: "zisekoz",
            totalPoints: 15
          },
          {
            name: "satchmo",
            totalPoints: 8
          }
        ],
        teamResults: [
          {
            name: "Live and Let DNF",
            totalPoints: 10
          },
          {
            name: "Dammit Sammir!",
            totalPoints: 8
          }
        ]
      }
    };
    const previousEvent = {
      standings: {
        driverStandings: [
          {
            name: "satchmo",
            totalPoints: 15
          },
          {
            name: "zisekoz",
            totalPoints: 10
          }
        ],
        teamStandings: [
          {
            name: "Live and Let DNF",
            totalPoints: 10
          },
          {
            name: "Dammit Sammir!",
            totalPoints: 8
          }
        ]
      }
    };
    calculateEventStandings(event, previousEvent);
    expect(event.standings).toEqual({
      driverStandings: [
        {
          currentPosition: 1,
          name: "zisekoz",
          totalPoints: 25,
          positionChange: 1,
          previousPosition: 2
        },
        {
          currentPosition: 2,
          name: "satchmo",
          totalPoints: 23,
          positionChange: -1,
          previousPosition: 1
        }
      ],
      teamStandings: [
        {
          currentPosition: 1,
          name: "Live and Let DNF",
          totalPoints: 20,
          positionChange: 0,
          previousPosition: 1
        },
        {
          currentPosition: 2,
          name: "Dammit Sammir!",
          totalPoints: 16,
          positionChange: 0,
          previousPosition: 2
        }
      ]
    });
  });

  test("calculates standings with no previous event", () => {
    const event = {
      results: {
        driverResults: [
          {
            name: "zisekoz",
            totalPoints: 15
          },
          {
            name: "satchmo",
            totalPoints: 8
          }
        ],
        teamResults: [
          {
            name: "Live and Let DNF",
            totalPoints: 10
          },
          {
            name: "Dammit Sammir!",
            totalPoints: 8
          }
        ]
      }
    };
    calculateEventStandings(event);
    expect(event.standings.driverStandings).toEqual([
      {
        currentPosition: 1,
        name: "zisekoz",
        totalPoints: 15,
        positionChange: null,
        previousPosition: null
      },
      {
        currentPosition: 2,
        name: "satchmo",
        totalPoints: 8,
        positionChange: null,
        previousPosition: null
      }
    ]);
  });

  it("calculates overall results", () => {
    const preOverallResults = require("./__fixtures__/preOverallLeague.json");
    expect(calculateOverall(preOverallResults.classes)).toEqual([
      {
        location: "Australia",
        results: {
          driverResults: [
            {
              className: "pro",
              entry: {
                isDnfEntry: false,
                isFounder: false,
                isPlayer: false,
                isVIP: false,
                name: "Kuul",
                nationality: "eLngEstonian",
                playerDiff: 0,
                rank: 1,
                stageDiff: "--",
                stageTime: "03:40.461",
                totalDiff: "--",
                totalTime: "56:18.651",
                vehicleName: "Peugeot 206 Rally"
              },
              name: "Kuul",
              overallPoints: 115,
              powerStagePoints: 5,
              totalPoints: 120
            },
            {
              className: "amateur",
              entry: {
                isDnfEntry: false,
                isFounder: false,
                isPlayer: false,
                isVIP: false,
                name: "Ssplatered",
                nationality: "eLngCanadian",
                playerDiff: 0,
                rank: 1,
                stageDiff: "--",
                stageTime: "03:40.304",
                totalDiff: "--",
                totalTime: "56:44.370",
                vehicleName: "Lancia Delta HF Integrale"
              },
              name: "Ssplatered",
              overallPoints: 84,
              powerStagePoints: 5,
              totalPoints: 89
            },
            {
              className: "pro",
              entry: {
                isDnfEntry: true,
                isFounder: false,
                isPlayer: false,
                isVIP: false,
                name: "Sladdikurvinen ™",
                nationality: "eLngSwedish",
                playerDiff: 0,
                rank: 28,
                stageDiff: "+11:19.539",
                stageTime: "15:00.000",
                totalDiff: "+03:03:41.349",
                totalTime: "04:00:00.000",
                vehicleName: "SUBARU Impreza (2001)"
              },
              name: "Sladdikurvinen ™",
              totalPoints: 0
            }
          ]
        }
      }
    ]);
  });

  it("gets event keys from recent results", () => {
    const recentResults = require("./__fixtures__/recentResults.json");
    const eventKeys = getEventKeysFromRecentResults(
      recentResults,
      {
        championshipIds: ["65933"]
      },
      "pro"
    );
    expect(eventKeys).toEqual([
      {
        challengeId: "65933",
        className: "pro",
        eventId: "66384",
        location: "ŁĘCZNA COUNTY",
        stageId: "4"
      }
    ]);
  });
});
