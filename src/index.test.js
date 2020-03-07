const { calculateEventResults, sortTeamResults } = require("./index");
const leaderboard = require("./__fixtures__/leaderboard");

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
        overallPoints: 20,
        playerDiff: 0,
        powerStagePoints: 5,
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
        teamId: "Live and Let DNF",
        totalPoints: 59
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
});
