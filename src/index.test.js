const {
  calculateEventResults,
  sortTeamResults,
  calculateEventStandings,
  calculateOverall
} = require("./index");
const leaderboard = require("./__fixtures__/leaderboard");
const { calculatePromotionRelegations } = require("./index");
const { calculatePromotionRelegation } = require("./index");
const { isDnsPenalty } = require("./index");
const { init } = require("./state/league");

describe("calculates event results", () => {
  let leagueRef;
  beforeEach(async () => {
    leagueRef = await init();
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
          stageDiff: "+00:09:27.000",
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
          totalDiff: "+00:18:23.013",
          totalTime: "04:59:59.000",
          vehicleName: "Ford Escort Mk II"
        },
        name: "SFR_rallimoilane",
        overallPoints: 9,
        pointsDisplay: 16,
        powerStagePoints: 5,
        stagePoints: 2,
        teamId: "Time Penalty Boys",
        totalPoints: 16
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
          stageDiff: "+00:00:01.001",
          stageTime: "05:34.001",
          totalDiff: "+00:28:24.013",
          totalTime: "05:10:00.000",
          vehicleName: "Ford Escort Mk II"
        },
        name: "Kuul",
        pointsDisplay: "DQ",
        teamId: "Ditch Dusters",
        totalPoints: 0
      },
      {
        divisionName: "pro",
        entry: {
          disqualificationReason: "Wrong car choice",
          isDnfEntry: true,
          isFounder: false,
          isPlayer: false,
          isVIP: false,
          name: "Pynklu",
          nationality: "belgish",
          playerDiff: 0,
          rank: 4,
          stageDiff: "+00:00:01.001",
          stageTime: "05:34.001",
          totalDiff: "+00:28:24.013",
          totalTime: "05:10:00.000",
          vehicleName: "Wrong Car"
        },
        name: "Pynklu",
        pointsDisplay: "DQ",
        teamId: "Ditch Dusters",
        totalPoints: 0
      }
    ];
    const driverResults = calculateEventResults({
      event: {
        racenetLeaderboardStages: [leaderboard, leaderboard],
        eventId: "221955"
      },
      drivers: {},
      divisionName: "pro",
      eventIndex: 0
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
        name: "Ditch Dusters",
        pointsDisplay: 0,
        totalPoints: 0
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
            currentPosition: 1
          },
          {
            name: "zisekoz",
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
      },
      results: {
        driverResults: [
          {
            name: "zisekoz",
            totalPoints: 10
          },
          {
            name: "satchmo",
            totalPoints: 15
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
    calculateEventStandings(event, [previousEvent], "pro");
    expect(event.standings).toMatchObject({
      driverStandings: [
        {
          currentPosition: 1,
          name: "zisekoz",
          totalPoints: 25,
          totalPointsAfterDropRounds: 25,
          positionChange: 1,
          previousPosition: 2
        },
        {
          currentPosition: 2,
          name: "satchmo",
          totalPoints: 23,
          totalPointsAfterDropRounds: 23,
          positionChange: -1,
          previousPosition: 1
        }
      ],
      teamStandings: [
        {
          currentPosition: 1,
          name: "Live and Let DNF",
          totalPoints: 20,
          totalPointsAfterDropRounds: 20,
          positionChange: 0,
          previousPosition: 1
        },
        {
          currentPosition: 2,
          name: "Dammit Sammir!",
          totalPoints: 16,
          totalPointsAfterDropRounds: 16,
          positionChange: 0,
          previousPosition: 2
        }
      ]
    });
    leagueRef.league.dropLowestScoringRoundsNumber = 1;
    calculateEventStandings(event, [previousEvent], "pro");
    expect(event.standings).toMatchObject({
      driverStandings: [
        {
          currentPosition: 1,
          name: "zisekoz",
          totalPoints: 25,
          totalPointsAfterDropRounds: 15,
          positionChange: 1,
          previousPosition: 2
        },
        {
          currentPosition: 2,
          name: "satchmo",
          totalPoints: 23,
          totalPointsAfterDropRounds: 15,
          positionChange: -1,
          previousPosition: 1
        }
      ],
      teamStandings: [
        {
          currentPosition: 1,
          name: "Live and Let DNF",
          totalPoints: 20,
          totalPointsAfterDropRounds: 10,
          positionChange: 0,
          previousPosition: 1
        },
        {
          currentPosition: 2,
          name: "Dammit Sammir!",
          totalPoints: 16,
          totalPointsAfterDropRounds: 8,
          positionChange: 0,
          previousPosition: 2
        }
      ]
    });
    leagueRef.league.dropLowestScoringRoundsNumber = 0;
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
    calculateEventStandings(event, null, "pro");
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

  describe("isDnsPenalty", () => {
    it("returns true when 1 DNS from 2 events", () => {
      const allResultsForDriver = [
        { entry: { isDnsEntry: true } },
        { entry: { isDnsEntry: false } },
        { entry: { isDnsEntry: true } },
        // ignored because showLivePoints = true
        { entry: { isDnsEntry: true } }
      ];
      expect(isDnsPenalty(allResultsForDriver)).toBeTruthy();
    });

    it("returns false when 1 DNS from 3 events", () => {
      const allResultsForDriver = [
        { entry: { isDnsEntry: false } },
        { entry: { isDnsEntry: false } },
        { entry: { isDnsEntry: true } },
        // ignored because showLivePoints = true
        { entry: { isDnsEntry: true } }
      ];
      expect(isDnsPenalty(allResultsForDriver)).toBeFalsy();
    });

    it("returns true when 2 DNS from 4 events", () => {
      const allResultsForDriver = [
        { entry: { isDnsEntry: true } },
        { entry: { isDnsEntry: true } },
        { entry: { isDnsEntry: true } },
        { entry: { isDnsEntry: false } },
        { entry: { isDnsEntry: true } },
        { entry: { isDnsEntry: true } },
        { entry: { isDnsEntry: false } }
      ];
      expect(isDnsPenalty(allResultsForDriver)).toBeTruthy();
    });
  });

  describe("calculatePromotionRelegation", () => {
    const createParams = (division, standingIndexPlusOne, numDrivers) => {
      return {
        standing: {},
        division,
        standingIndexPlusOne,
        numDrivers
      };
    };

    const division = {
      promotionRelegation: {
        promotionDoubleZone: 2,
        promotionZone: 3,
        relegationZone: 3
      }
    };

    it("returns -1 when standing is in relegation zone", () => {
      const params = createParams(division, 18, 20);
      calculatePromotionRelegation(params);
      expect(params.standing.promotionRelegation).toEqual(-1);
    });

    it("returns undefined when standing is not in relegation zone or promotion zone", () => {
      let params = createParams(division, 17, 20);
      calculatePromotionRelegation(params);
      expect(params.standing.promotionRelegation).toBeUndefined();

      params = createParams(division, 6, 20);
      calculatePromotionRelegation(params);
      expect(params.standing.promotionRelegation).toBeUndefined();
    });

    it("returns 2 when standing is in promotion double zone", () => {
      const params = createParams(division, 2, 20);
      calculatePromotionRelegation(params);
      expect(params.standing.promotionRelegation).toEqual(2);
    });

    it("returns 1 when standing is in promotion zone", () => {
      let params = createParams(division, 3, 20);
      calculatePromotionRelegation(params);
      expect(params.standing.promotionRelegation).toEqual(1);

      params = createParams(division, 5, 20);
      calculatePromotionRelegation(params);
      expect(params.standing.promotionRelegation).toEqual(1);
    });

    it("returns green when standing is in promotion zone with no double promotion zone", () => {
      const params = createParams(
        {
          promotionRelegation: {
            promotionZone: 3
          }
        },
        3,
        20
      );
      calculatePromotionRelegation(params);
      expect(params.standing.promotionRelegation).toEqual(1);
    });
  });

  describe("calculatePromotionRelegations", () => {
    it("calculates only on standings with no dnsPenalty", () => {
      const standings = [
        { dnsPenalty: true },
        { dnsPenalty: false },
        { dnsPenalty: false }
      ];
      calculatePromotionRelegations(standings, "pro");
      expect(standings).toEqual([
        {
          dnsPenalty: true
        },
        {
          dnsPenalty: false,
          promotionRelegation: 1
        },
        {
          dnsPenalty: false
        }
      ]);
    });
  });
});
