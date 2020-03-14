const {
  calculateEventResults,
  sortTeamResults,
  calculateEventStandings,
  populateOverallResults
} = require("./index");
const leaderboard = require("./__fixtures__/leaderboard");
const leagueResults = require("../hidden/out/leagueResults.json");

describe("calculates event results", () => {
  test("returns results for drivers", () => {
    const expected = [
      {
        isDnfEntry: true,
        isFounder: false,
        isPlayer: false,
        isVIP: false,
        name: "Spookex *-*",
        nationality: "eLngLatvian",
        overallPoints: 30,
        playerDiff: 0,
        powerStagePoints: 4,
        totalPoints: 34,
        rank: 1,
        stageDiff: "--",
        stageTime: "15:00.000",
        totalDiff: "--",
        totalTime: "04:41:35.987",
        vehicleName: "Alpine Renault A110 1600 S"
      },
      {
        isDnfEntry: true,
        isFounder: false,
        isPlayer: false,
        isVIP: false,
        name: "ThatGrosejanBoi",
        nationality: "eLngLatvian",
        overallPoints: 24,
        playerDiff: 0,
        powerStagePoints: 5,
        totalPoints: 29,
        rank: 2,
        stageDiff: "--",
        stageTime: "05:34.000",
        totalDiff: "+18:24.013",
        totalTime: "05:00:00.000",
        vehicleName: "Ford Escort Mk II"
      }
    ];
    expect(calculateEventResults(leaderboard).driverResults).toEqual(expected);
  });

  test("returns results for teams", () => {
    const expected = [
      {
        name: "Dammit Samir!",
        totalPoints: 24
      }
    ];
    expect(calculateEventResults(leaderboard).teamResults).toEqual(expected);
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

  test("populates overall results", () => {
    populateOverallResults(leagueResults);
    expect(leagueResults.overall[0].results.driverResults[0].name).toEqual(
      "Kuul"
    );
    expect(leagueResults.overall[0].results.driverResults[15].name).toEqual(
      "SFR_rallimoilane"
    );
  });
});
