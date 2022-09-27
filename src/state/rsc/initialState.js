const initialState = {
  pointsForDNF: false,
  websiteName: "rsc-results",
  useStandingsForHome: true,
  // subfolderName: "rbr",
  showLivePoints: false,
  showLivePointsDaysRemaining: 3,
  noSuperRallyPointsMultiplier: 2,
  dropLowestScoringRoundsNumber: 2,
  afterDropRoundMessage:
    "*After Dropped Rounds: total points after 2 lowest scoring rounds removed - endurance rounds count as 2",
  sortByDropRoundPoints: false,
  showSuperRallyColumn: true,
  hideCarColumnInStandings: true,
  showCarNameAsTextInResults: true,
  nullTeamIsPrivateer: true,
  // useCarAsTeam: false,
  // useCarClassAsTeam: true,
  showTeamNameTextColumn: true,
  hideTeamLogoColumn: true,
  disableOverall: true,
  teamPointsForPowerstage: false,
  backgroundStyle:
    "background-image: linear-gradient(315deg, #ffffff 0%, #d7e1ec 74%); background-size: cover; background-repeat: no-repeat; background-attachment: fixed;",
  logo: "rsc-guy.png",
  siteTitlePrefix: "RSC",
  hideStageTimesUntilEventEnd: true,
  teamOverride: {},
  divisions: {
    rsc: {
      divisionName: "rsc5",
      displayName: "RSC Season 5",
      disableSameCarValidation: true,
      // enableSameCarClassValidation: true,
      // maxDriversScoringPointsForTeam: 2,
      // filterEntries: true,
      rbr: {
        rallies: [
          {
            eventId: 47367,
            endTime: "2022-10-03 12:00",
            locationName: "Rally Grundstrom",
            locationFlag: "SE",
            numStages: 7
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
