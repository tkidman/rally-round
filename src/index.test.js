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
        divisionName: "pro",
        entry: {
          isDnfEntry: false,
          isFounder: false,
          isPlayer: false,
          isVIP: false,
          name: "Spookex *-*",
          nationality: "eLngLatvian",
          playerDiff: 0,
          rank: 1,
          stageDiff: "--",
          stageTime: "15:00.000",
          totalDiff: "--",
          totalTime: "04:41:35.987",
          vehicleName: "Alpine Renault A110 1600 S"
        },
        name: "Spookex *-*",
        overallPoints: 10,
        pointsDisplay: 14,
        powerStagePoints: 4,
        teamId: "Time Penalty Boys",
        totalPoints: 14
      },
      {
        divisionName: "pro",
        entry: {
          isDnfEntry: false,
          isFounder: false,
          isManualResult: true,
          isPlayer: false,
          isVIP: false,
          name: "SFRrallimoilane",
          nationality: "eLngLatvian",
          playerDiff: 0,
          rank: 2,
          stageDiff: "--",
          stageTime: "05:33.000",
          totalDiff: "+18:23.013",
          totalTime: "04:59:59.000",
          vehicleName: "Ford Escort Mk II"
        },
        name: "SFRrallimoilane",
        overallPoints: 9,
        pointsDisplay: 14,
        powerStagePoints: 5,
        teamId: "Time Penalty Boys",
        totalPoints: 14
      },
      {
        divisionName: "pro",
        entry: {
          disqualificationReason: "Wrong car choice",
          isDnfEntry: true,
          isFounder: false,
          isPlayer: false,
          isVIP: false,
          name: "Kuul",
          nationality: "eLngLatvian",
          playerDiff: 0,
          rank: 3,
          stageDiff: "--",
          stageTime: "05:34.001",
          totalDiff: "+18:24.013",
          totalTime: "05:10:00.000",
          vehicleName: "Ford Escort Mk II"
        },
        name: "Kuul",
        pointsDisplay: "DQ",
        teamId: "Unlimited Pedal Works",
        totalPoints: 0
      }
    ];
    const driverResults = calculateEventResults({
      event: {
        racenetLeaderboardStages: [leaderboard, leaderboard],
        eventId: "221955"
      },
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
        pointsDisplay: 10,
        totalPoints: 10
      },
      {
        divisionName: "pro",
        driverResultsCounted: 0,
        name: "Unlimited Pedal Works",
        pointsDisplay: 0,
        totalPoints: 0
      }
    ];
    expect(
      calculateEventResults({
        event: {
          racenetLeaderboardStages: [leaderboard, leaderboard]
        },
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
            name: "satchmo",
            totalPoints: 15,
            currentPosition: 1
          },
          {
            name: "zisekoz",
            totalPoints: 10,
            currentPosition: 2
          }
        ],
        teamStandings: [
          {
            name: "Live and Let DNF",
            totalPoints: 10,
            currentPosition: 1
          },
          {
            name: "Dammit Sammir!",
            totalPoints: 8,
            currentPosition: 2
          }
        ]
      }
    };
    calculateEventStandings(event, previousEvent);
    expect(event.standings).toMatchObject({
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
    expect(event.standings.driverStandings).toMatchObject([
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
    expect(calculateOverall(preOverallResults.divisions)).toMatchSnapshot();
  });
});
