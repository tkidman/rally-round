const initialState = {
  pointsForDNF: false,
  websiteName: "rsc-results",
  useStandingsForHome: true,
  // subfolderName: "rbr",
  showLivePoints: true,
  showLivePointsDaysRemaining: 4,
  // noSuperRallyPointsMultiplier: 2,
  // dropLowestScoringRoundsNumber: 2,
  // afterDropRoundMessage:
  //   "*After Dropped Rounds: total points after 2 lowest scoring rounds removed - endurance rounds count as 2",
  // sortByDropRoundPoints: true,
  showSuperRallyColumn: true,
  hideCarColumnInStandings: false,
  showCarNameAsTextInResults: false,
  // nullTeamIsPrivateer: true,
  useCarAsTeam: false,
  // useCarClassAsTeam: true,
  showTeamNameTextColumn: true,
  hideTeamLogoColumn: true,
  disableOverall: true,
  teamPointsForPowerstage: false,
  backgroundStyle:
    "background-image: linear-gradient(315deg, #ffffff 0%, #d7e1ec 74%); background-size: cover; background-repeat: no-repeat; background-attachment: fixed;",
  logo: "rsc-guy.png",
  siteTitlePrefix: "RSC WRC 1987",
  hideStageTimesUntilEventEnd: true,
  teamOverride: {},
  historicalSeasonLinks: [
    { name: "Season 4", href: "/rsc-4" },
    { name: "Season 5", href: "/rsc-5" }
  ],
  divisions: {
    rsc1987GroupA: {
      divisionName: "rsc1987GroupA",
      displayName: "WRC 1987 Group A",
      disableSameCarValidation: false,
      // enableSameCarClassValidation: true,
      maxDriversScoringPointsForTeam: 2,
      filterEntries: { matchDivision: true },
      rbr: {
        rallies: [
          {
            eventId: 49449,
            endTime: "2022-12-05 12:00",
            locationName: "Tour de Corse",
            locationFlag: "FR",
            numStages: 8
            // enduranceRoundMultiplier: 2
          },
          {
            eventId: 49789,
            endTime: "2022-12-12 12:00",
            locationName: "Olympus Rally",
            locationFlag: "US",
            numStages: 7
            // enduranceRoundMultiplier: 2
          },
          {
            eventId: 50089,
            endTime: "2022-12-19 12:00",
            locationName: "RAC Rally",
            locationFlag: "GB",
            numStages: 8
            // enduranceRoundMultiplier: 2
          }
        ]
      },
      manualResults: [],
      events: [],
      points: {
        powerStage: [],
        overall: [20, 17, 14, 12, 10, 8, 6, 4, 2, 1]
        // stage: [1]
      }
      // cars: ["Peugeot 205 GTI"]
      // outputSheetId: "1C3fU9y1236wFmPuKcui4CEXBuSsUANH6OJ0BpQIasTc"
    },
    rsc1987GroupN: {
      divisionName: "rsc1987GroupN",
      displayName: "WRC 1987 Group N",
      disableSameCarValidation: false,
      // enableSameCarClassValidation: true,
      maxDriversScoringPointsForTeam: 3,
      filterEntries: { matchDivision: true },
      rbr: {
        rallies: [
          {
            eventId: 49516,
            endTime: "2022-12-05 12:00",
            locationName: "Tour de Corse",
            locationFlag: "FR",
            numStages: 8
            // enduranceRoundMultiplier: 2
          },
          {
            eventId: 49789,
            endTime: "2022-12-12 12:00",
            locationName: "Olympus Rally",
            locationFlag: "US",
            numStages: 7
            // enduranceRoundMultiplier: 2
          },
          {
            eventId: 50089,
            endTime: "2022-12-19 12:00",
            locationName: "RAC Rally",
            locationFlag: "GB",
            numStages: 8
            // enduranceRoundMultiplier: 2
          }
        ]
      },
      manualResults: [],
      events: [],
      points: {
        powerStage: [],
        overall: [20, 17, 14, 12, 10, 8, 6, 4, 2, 1]
        // stage: [1]
      }
      // cars: ["Peugeot 205 GTI"]
      // outputSheetId: "1C3fU9y1236wFmPuKcui4CEXBuSsUANH6OJ0BpQIasTc"
    },
    rsc1987Overall: {
      divisionName: "rsc1987Overall",
      displayName: "WRC 1987 Overall",
      disableSameCarValidation: false,
      // enableSameCarClassValidation: true,
      maxDriversScoringPointsForTeam: 2,
      // filterEntries: true,
      rbr: {
        rallies: [
          {
            eventIds: [49449, 49516],
            endTime: "2022-12-05 12:00",
            locationName: "Tour de Corse",
            locationFlag: "FR",
            numStages: 8
            // enduranceRoundMultiplier: 2
          },
          {
            eventId: 49789,
            endTime: "2022-12-12 12:00",
            locationName: "Olympus Rally",
            locationFlag: "US",
            numStages: 7
            // enduranceRoundMultiplier: 2
          },
          {
            eventId: 50089,
            endTime: "2022-12-19 12:00",
            locationName: "RAC Rally",
            locationFlag: "GB",
            numStages: 8
            // enduranceRoundMultiplier: 2
          }
        ]
      },
      manualResults: [],
      events: [],
      points: {
        powerStage: [],
        overall: [20, 17, 14, 12, 10, 8, 6, 4, 2, 1]
        // stage: [1]
      }
      // cars: ["Peugeot 205 GTI"]
      // outputSheetId: "1C3fU9y1236wFmPuKcui4CEXBuSsUANH6OJ0BpQIasTc"
    }
  }
};
module.exports = initialState;
