const {
  calculateEventResults,
  sortTeamResults,
  calculateEventStandings,
  calculateOverall
} = require("./index");
const leaderboard = require("./__fixtures__/leaderboard");
const { getEventKeysFromRecentResults } = require("./index");
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
    const driverResults = calculateEventResults(leaderboard, null, "pro")
      .driverResults;
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
    expect(calculateOverall(preOverallResults.divisions)).toEqual({
      events: [
        {
          location: "Australia",
          results: {
            driverResults: [
              {
                divisionName: "pro",
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
                divisionName: "amateur",
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
                divisionName: "pro",
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
            ],
            teamResults: [
              {
                divisionName: "overall",
                name: "Ditch Dusters",
                totalPoints: 290
              },
              {
                divisionName: "overall",
                name: "Unlimited Pedal Works",
                totalPoints: 164
              }
            ]
          },
          standings: {
            driverStandings: [
              {
                currentPosition: 1,
                name: "Kuul",
                positionChange: null,
                previousPosition: null,
                totalPoints: 120
              },
              {
                currentPosition: 2,
                name: "Ssplatered",
                positionChange: null,
                previousPosition: null,
                totalPoints: 89
              },
              {
                currentPosition: 3,
                name: "Sladdikurvinen ™",
                positionChange: null,
                previousPosition: null,
                totalPoints: 0
              }
            ],
            teamStandings: [
              {
                currentPosition: 1,
                name: "Ditch Dusters",
                positionChange: null,
                previousPosition: null,
                totalPoints: 290
              },
              {
                currentPosition: 2,
                name: "Unlimited Pedal Works",
                positionChange: null,
                previousPosition: null,
                totalPoints: 164
              }
            ]
          }
        }
      ]
    });
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
