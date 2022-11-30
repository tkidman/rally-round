const initialState = {
  pointsForDNF: false,
  websiteName: "rsc-results",
  useStandingsForHome: true,
  // subfolderName: "rbr",
  showLivePoints: false,
  showLivePointsDaysRemaining: 4,
  noSuperRallyPointsMultiplier: 2,
  // dropLowestScoringRoundsNumber: 2,
  // afterDropRoundMessage:
  //   "*After Dropped Rounds: total points after 2 lowest scoring rounds removed - endurance rounds count as 2",
  // sortByDropRoundPoints: true,
  showSuperRallyColumn: true,
  hideCarColumnInStandings: true,
  showCarNameAsTextInResults: true,
  // nullTeamIsPrivateer: true,
  useCarAsTeam: false,
  // useCarClassAsTeam: true,
  showTeamNameTextColumn: true,
  hideTeamLogoColumn: true,
  disableOverall: false,
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
      displayName: "Group A",
      disableSameCarValidation: false,
      // enableSameCarClassValidation: true,
      maxDriversScoringPointsForTeam: 2,
      // filterEntries: true,
      rbr: {
        rallies: [
          {
            eventId: 49449,
            endTime: "2022-12-05 12:00",
            locationName: "Tour de Corse",
            locationFlag: "FR",
            numStages: 8
            // enduranceRoundMultiplier: 2
          }
        ]
      },
      manualResults: [],
      events: [],
      points: {
        powerStage: [5, 4, 3, 2, 1],
        overall: [30, 24, 19, 15, 12, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1]
        // stage: [1]
      }
      // cars: ["Peugeot 205 GTI"]
      // outputSheetId: "1C3fU9y1236wFmPuKcui4CEXBuSsUANH6OJ0BpQIasTc"
    },
    rsc1987GroupN: {
      divisionName: "rsc1987GroupN",
      displayName: "Group N",
      disableSameCarValidation: false,
      // enableSameCarClassValidation: true,
      maxDriversScoringPointsForTeam: 2,
      // filterEntries: true,
      rbr: {
        rallies: [
          {
            eventId: 49516,
            endTime: "2022-12-05 12:00",
            locationName: "Tour de Corse",
            locationFlag: "FR",
            numStages: 8
            // enduranceRoundMultiplier: 2
          }
        ]
      },
      manualResults: [],
      events: [],
      points: {
        powerStage: [5, 4, 3, 2, 1],
        overall: [30, 24, 19, 15, 12, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1]
        // stage: [1]
      }
      // cars: ["Peugeot 205 GTI"]
      // outputSheetId: "1C3fU9y1236wFmPuKcui4CEXBuSsUANH6OJ0BpQIasTc"
    }
  }
};
module.exports = initialState;
