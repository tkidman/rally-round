const initialState = {
  pointsForDNF: false,
  websiteName: "jrc-results",
  subfolderName: "rbr",
  showLivePoints: false,
  showLivePointsDaysRemaining: 3,
  hideCarColumnInStandings: true,
  showCarNameAsTextInResults: true,
  nullTeamIsPrivateer: true,
  // useCarAsTeam: false,
  // useCarClassAsTeam: true,
  disableOverall: true,
  teamPointsForPowerstage: true,
  backgroundStyle:
    "background-image: linear-gradient(315deg, #eec0c6 0%, #7ee8fa 74%); background-size: cover; background-repeat: no-repeat; background-attachment: fixed;",
  logo: "JRC.png",
  siteTitlePrefix: "JRC",
  divisions: {
    jrcRbr: {
      divisionName: "rbrSeason2",
      displayName: "RBR Season 2",
      disableSameCarValidation: false,
      // enableSameCarClassValidation: true,
      maxDriversScoringPointsForTeam: 2,
      // filterEntries: true,
      rbr: {
        rallies: [
          {
            eventId: 44820,
            endTime: "2022-07-03 23:59",
            locationName: "Rallye Monte-Cresto",
            locationFlag: "MC",
            numStages: 8
          },
          {
            eventId: 45147,
            endTime: "2022-07-11 12:59",
            locationName: "Arctic Nordic Rally",
            locationFlag: "FI",
            numStages: 8
          }
        ]
      },
      manualResults: [],
      events: [],
      points: {
        powerStage: [5, 4, 3, 2, 1],
        overall: [24, 19, 16, 14, 12, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1]
        // stage: [1]
      }
      // cars: ["Peugeot 205 GTI"]
      // outputSheetId: "1C3fU9y1236wFmPuKcui4CEXBuSsUANH6OJ0BpQIasTc"
    }
  }
};
module.exports = initialState;
