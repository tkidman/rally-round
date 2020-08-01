const {
  calculateEventResults,
  sortTeamResults,
  calculateEventStandings,
  calculateOverall
} = require("./index");
const leaderboard = require("./__fixtures__/leaderboard");
const { init } = require("./state/league");

describe("calculates event results", () => {
  beforeEach(async () => {
    await init();
  });

  test("returns results for drivers", () => {
    const expected = [
      {
        name: "Spookex *-*",
        entry: {
          rank: 1,
          name: "Spookex *-*",
          isVIP: false,
          isFounder: false,
          isPlayer: false,
          isDnfEntry: false,
          playerDiff: 0,
          vehicleName: "Alpine Renault A110 1600 S",
          stageTime: "15:00.000",
          stageDiff: "--",
          totalTime: "04:41:35.987",
          totalDiff: "--",
          nationality: "eLngLatvian"
        },
        powerStagePoints: 4,
        overallPoints: 10,
        totalPoints: 14,
        teamId: "Time Penalty Boys",
        divisionName: "pro"
      },
      {
        name: "SFRrallimoilane",
        entry: {
          rank: 2,
          name: "SFRrallimoilane",
          isVIP: false,
          isFounder: false,
          isPlayer: false,
          isDnfEntry: false,
          playerDiff: 0,
          vehicleName: "Ford Escort Mk II",
          stageTime: "05:34.000",
          stageDiff: "--",
          totalTime: "05:00:00.000",
          totalDiff: "+18:24.013",
          nationality: "eLngLatvian"
        },
        powerStagePoints: 5,
        overallPoints: 9,
        totalPoints: 14,
        teamId: "Time Penalty Boys",
        divisionName: "pro"
      },
      {
        name: "Kuul",
        entry: {
          rank: 3,
          name: "Kuul",
          isVIP: false,
          isFounder: false,
          isPlayer: false,
          isDnfEntry: true,
          playerDiff: 0,
          vehicleName: "Ford Escort Mk II",
          stageTime: "05:34.001",
          stageDiff: "--",
          totalTime: "05:10:00.000",
          totalDiff: "+18:24.013",
          nationality: "eLngLatvian",
          disqualificationReason: "Wrong car choice"
        },
        totalPoints: 0,
        teamId: "Unlimited Pedal Works",
        divisionName: "pro"
      }
    ];
    const driverResults = calculateEventResults({
      event: { racenetLeaderboard: leaderboard },
      drivers: {},
      divisionName: "pro"
    }).driverResults;
    expect(driverResults).toEqual(expected);
  });

  test("returns results for teams", () => {
    const expected = [
      {
        divisionName: "pro",
        driverResultsCounted: 1,
        name: "Time Penalty Boys",
        totalPoints: 10
      },
      {
        divisionName: "pro",
        driverResultsCounted: 0,
        name: "Unlimited Pedal Works",
        totalPoints: 0
      }
    ];
    expect(
      calculateEventResults({
        event: { racenetLeaderboard: leaderboard },
        drivers: {},
        divisionName: "pro"
      }).teamResults
    ).toEqual(expected);
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
            currentStanding: {
              name: "satchmo",
              totalPoints: 15
            },
            allStandings: [{ name: "satchmo", totalPoints: 15 }]
          },
          {
            currentStanding: {
              name: "zisekoz",
              totalPoints: 10
            },
            allStandings: [
              {
                name: "zisekoz",
                totalPoints: 10
              }
            ]
          }
        ],
        teamStandings: [
          {
            currentStanding: {
              name: "Live and Let DNF",
              totalPoints: 10
            },
            allStandings: [
              {
                name: "Live and Let DNF",
                totalPoints: 10
              }
            ]
          },
          {
            currentStanding: {
              name: "Dammit Sammir!",
              totalPoints: 8
            },
            allStandings: [
              {
                name: "Dammit Sammir!",
                totalPoints: 8
              }
            ]
          }
        ]
      }
    };
    calculateEventStandings(event, previousEvent);
    expect(event.standings).toMatchObject({
      driverStandings: [
        {
          currentStanding: {
            currentPosition: 1,
            name: "zisekoz",
            totalPoints: 25,
            positionChange: 1,
            previousPosition: 2
          }
        },
        {
          currentStanding: {
            currentPosition: 2,
            name: "satchmo",
            totalPoints: 23,
            positionChange: -1,
            previousPosition: 1
          }
        }
      ],
      teamStandings: [
        {
          currentStanding: {
            currentPosition: 1,
            name: "Live and Let DNF",
            totalPoints: 20,
            positionChange: 0,
            previousPosition: 1
          }
        },
        {
          currentStanding: {
            currentPosition: 2,
            name: "Dammit Sammir!",
            totalPoints: 16,
            positionChange: 0,
            previousPosition: 2
          }
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
    expect(event.standings.driverStandings).toMatchObject([
      {
        currentStanding: {
          currentPosition: 1,
          name: "zisekoz",
          totalPoints: 15,
          positionChange: null,
          previousPosition: null
        }
      },
      {
        currentStanding: {
          currentPosition: 2,
          name: "satchmo",
          totalPoints: 8,
          positionChange: null,
          previousPosition: null
        }
      }
    ]);
  });

  it("calculates overall results", () => {
    const preOverallResults = require("./__fixtures__/preOverallLeague.json");
    expect(calculateOverall(preOverallResults.divisions)).toMatchSnapshot();
  });
});
