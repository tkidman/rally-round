const {
  calculateEventResults,
  sortTeamResults,
  calculateEventStandings
} = require("./index");
const leaderboard = require("./__fixtures__/leaderboard");

describe("calculates event results", () => {
  test("returns results for drivers", () => {
    const expected = [
      {
        className: "pro",
        name: "Spookex *-*",
        overallPoints: 10,
        powerStagePoints: 4,
        totalPoints: 14
      },
      {
        className: "pro",
        name: "SFRrallimoilane",
        overallPoints: 9,
        powerStagePoints: 5,
        totalPoints: 14
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
});
