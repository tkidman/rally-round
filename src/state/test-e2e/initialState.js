const initialState = {
  pointsForDNF: false,
  useStandingsForHome: true,
  showLivePoints: true,
  showLivePointsDaysRemaining: 9,
  noSuperRallyPointsMultiplier: 2,
  dropLowestScoringRoundsNumber: 2,
  afterDropRoundMessage:
    "*After Dropped Rounds: total points after 2 lowest scoring rounds removed - endurance rounds count as 2",
  sortByDropRoundPoints: false,
  showSuperRallyColumn: true,
  hideCarColumnInStandings: true,
  showCarNameAsTextInResults: true,
  nullTeamIsPrivateer: true,
  showTeamNameTextColumn: true,
  hideTeamLogoColumn: true,
  disableOverall: false,
  teamPointsForPowerstage: false,
  backgroundStyle:
    "background-image: linear-gradient(315deg, #ffffff 0%, #d7e1ec 74%); background-size: cover; background-repeat: no-repeat; background-attachment: fixed;",
  logo: "rsc-guy.png",
  siteTitlePrefix: "TEST-E2E",
  hideStageTimesUntilEventEnd: true,
  overrideLastUpdated: "last-updated-test-e2e",
  teamOverride: {},
  historicalSeasonLinks: [{ name: "E2E Season 1", href: "/e2e-1" }],
  divisions: {
    testE2E: {
      divisionName: "test-e2e",
      displayName: "Test E2E",
      disableSameCarValidation: true,
      rbr: {
        rallies: [
          {
            eventId: 47367,
            endTime: "2022-10-03 12:00",
            locationName: "Rally Grundstrom",
            locationFlag: "SE",
            numStages: 7,
            legs: [
              { startIndex: 0, endIndex: 3 },
              { startIndex: 4, endIndex: 6 }
            ]
          },
          {
            eventId: 47616,
            endTime: "2022-10-10 12:00",
            locationName: "Rally Nonko",
            locationFlag: "EE",
            numStages: 8,
            legs: [
              { startIndex: 0, endIndex: 3 },
              { startIndex: 4, endIndex: 7 }
            ]
          }
        ]
      },
      manualResults: [
        {
          eventIndex: 0,
          results: [
            {
              name: "Weepy",
              stageTime: "00:12:41.500",
              totalTime: "1:01:05.901",
              extraInfo: "10s penalty for cutting"
            }
          ]
        }
      ],
      points: {
        powerStage: [5, 4, 3, 2, 1],
        leg: [1],
        overall: [30, 24, 19, 15, 12, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1]
      }
    },
    testE2E2: {
      divisionName: "test-e2e2",
      displayName: "Test E2E2",
      disableSameCarValidation: true,
      rbr: {
        rallies: [
          {
            eventId: 47368,
            endTime: "2022-10-03 12:00",
            locationName: "Rally Grundstrom",
            locationFlag: "SE",
            numStages: 7
          },
          {
            eventId: 47617,
            endTime: "2022-10-10 12:00",
            locationName: "Rally Nonko",
            locationFlag: "EE",
            numStages: 8
          }
        ]
      },
      manualResults: [],
      points: {
        powerStage: [5, 4, 3, 2, 1],
        overall: [30, 24, 19, 15, 12, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1]
      }
    }
  }
};
module.exports = initialState;
