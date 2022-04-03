const initialState = {
  pointsForDNF: false,
  websiteName: "jrc-results",
  subfolderName: "themed",
  showLivePoints: true,
  showLivePointsDaysRemaining: 4,
  hideCarColumnInStandings: false,
  // showCarNameAsTextInResults: true,
  // useCarAsTeam: false,
  // useCarClassAsTeam: true,
  disableOverall: true,
  // teamPointsForPowerstage: false,
  backgroundStyle:
    "background-image: linear-gradient(315deg, #eec0c6 0%, #7ee8fa 74%); background-size: cover; background-repeat: no-repeat; background-attachment: fixed;",
  logo: "JRC.png",
  siteTitlePrefix: "JRC",
  divisions: {
    peugeotRallyChallenge: {
      divisionName: "peugeotRallyChallenge",
      displayName: "Peugeot Rally Challenge",
      disableSameCarValidation: false,
      // enableSameCarClassValidation: true,
      // maxDriversScoringPointsForTeam: 4,
      // filterEntries: true,
      clubs: [{ clubId: "256173", championshipIds: ["573785"] }],
      manualResults: [],
      events: [],
      points: {
        powerStage: [],
        overall: [25, 20, 16, 13, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1]
        // stage: [1]
      },
      cars: ["Peugeot 205 GTI"]
      // outputSheetId: "1C3fU9y1236wFmPuKcui4CEXBuSsUANH6OJ0BpQIasTc"
    }
  }
};
module.exports = initialState;
