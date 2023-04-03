const initialState = {
  pointsForDNF: false,
  websiteName: "rsc-results",
  useStandingsForHome: true,
  // subfolderName: "rbr",
  showLivePoints: true,
  showLivePointsDaysRemaining: 4,
  noSuperRallyPointsMultiplier: 2,
  dropLowestScoringRoundsNumber: 2,
  afterDropRoundMessage:
    "*After Dropped Rounds: total points after 2 lowest scoring rounds removed - endurance rounds count as 2",
  sortByDropRoundPoints: true,
  showSuperRallyColumn: true,
  hideCarColumnInStandings: false,
  showCarNameAsTextInResults: true,
  nullTeamIsPrivateer: true,
  useCarAsTeam: false,
  // useCarClassAsTeam: true,
  showTeamNameTextColumn: true,
  hideTeamLogoColumn: true,
  disableOverall: true,
  teamPointsForPowerstage: false,
  backgroundStyle:
    "background-image: linear-gradient(315deg, #ffffff 0%, #d7e1ec 74%); background-size: cover; background-repeat: no-repeat; background-attachment: fixed;",
  logo: "rsc-guy.png",
  siteTitlePrefix: "RSC Season 6",
  hideStageTimesUntilEventEnd: true,
  teamOverride: {},
  historicalSeasonLinks: [
    { name: "Season 4", href: "/rsc-4" },
    { name: "Season 5", href: "/rsc-5" },
    { name: "WRC 1987", href: "/rsc-1987" }
  ],
  divisions: {
    rscSeason6: {
      divisionName: "rscSeason6",
      displayName: "RSC Season 6",
      disableSameCarValidation: true,
      // enableSameCarClassValidation: true,
      maxDriversScoringPointsForTeam: 2,
      // filterEntries: { matchDivision: true },
      rbr: {
        rallies: [
          {
            eventId: 51646,
            endTime: "2023-01-30 12:00",
            locationName: "Rally Finland",
            locationFlag: "FI",
            numStages: 7
            // enduranceRoundMultiplier: 2
          },
          {
            eventId: 52043,
            endTime: "2023-02-06 12:00",
            locationName: "Central Europe Rally",
            locationFlag: "EU",
            numStages: 6
            // enduranceRoundMultiplier: 2
          },
          {
            eventId: 52371,
            endTime: "2023-02-13 22:00",
            locationName: "Safari Rally",
            locationFlag: "KE",
            numStages: 6
            // enduranceRoundMultiplier: 2
          },
          {
            eventId: 52474,
            endTime: "2023-02-27 22:00",
            locationName: "Rally Sweden",
            locationFlag: "SE",
            numStages: 17,
            enduranceRoundMultiplier: 2
          },
          {
            eventId: 53208,
            endTime: "2023-03-06 22:00",
            locationName: "Rally Australasia",
            locationFlag: "AU",
            numStages: 7
            // enduranceRoundMultiplier: 1
          },
          {
            eventId: 53436,
            endTime: "2023-03-13 22:00",
            locationName: "Superspecial Rally",
            locationFlag: "EU",
            numStages: 11
            // enduranceRoundMultiplier: 1
          },
          {
            eventId: 53808,
            endTime: "2023-03-20 22:00",
            locationName: "Rally PolItaly",
            locationFlag: "PL",
            numStages: 6
            // enduranceRoundMultiplier: 1
          },
          {
            eventId: 53924,
            endTime: "2023-04-03 22:00",
            locationName: "Rally Monte Carlo",
            locationFlag: "MC",
            numStages: 15,
            enduranceRoundMultiplier: 2
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
