const initialState = {
  pointsForDNF: false,
  websiteName: "jrc-results",
  subfolderName: "rbr",
  showLivePoints: true,
  showLivePointsDaysRemaining: 4,
  hideCarColumnInStandings: false,
  showCarNameAsTextInResults: true,
  // useCarAsTeam: false,
  // useCarClassAsTeam: true,
  disableOverall: true,
  // teamPointsForPowerstage: false,
  isRBR: true,
  backgroundStyle:
    "background-image: linear-gradient(315deg, #eec0c6 0%, #7ee8fa 74%); background-size: cover; background-repeat: no-repeat; background-attachment: fixed;",
  divisions: {
    jrcRbr: {
      divisionName: "rbrSeason1",
      displayName: "RBR Season 1",
      disableSameCarValidation: false,
      // enableSameCarClassValidation: true,
      // maxDriversScoringPointsForTeam: 4,
      // filterEntries: true,
      rbr: {
        rallies: [
          {
            rbrRallyId: 40706,
            endTime: "2022-01-31 00:59",
            locationName: "Monte Carlo",
            locationFlag: ""
          },
          {
            rbrRallyId: 41156,
            endTime: "2022-02-14 12:59",
            locationName: "Arctic Nordic",
            locationFlag: ""
          }
        ]
      },
      manualResults: [],
      events: [],
      points: {
        powerStage: [],
        overall: [25, 20, 16, 13, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1]
        // stage: [1]
      }
      // cars: ["Peugeot 205 GTI"]
      // outputSheetId: "1C3fU9y1236wFmPuKcui4CEXBuSsUANH6OJ0BpQIasTc"
    }
  }
};
module.exports = initialState;
