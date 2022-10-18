const initialState = {
  pointsForDNF: false,
  websiteName: "jrc-results",
  subfolderName: "world-cup",
  showLivePoints: true,
  showLivePointsDaysRemaining: 4,
  showCarNameAsTextInResults: true,
  hideCarColumnInStandings: false,
  useCarAsTeam: false,
  useNationalityAsTeam: true,
  disableOverall: true,
  teamPointsForPowerstage: false,
  incorrectCarTimePenaltySeconds: 120,
  backgroundStyle:
    "background-image: linear-gradient(#2193b0, #6dd5ed); background-size: cover; background-repeat: no-repeat; background-attachment: fixed;",
  logo: "JRC.png",
  siteTitlePrefix: "JRC",
  hideFromSeriesLinks: true,
  divisions: {
    worldCup: {
      divisionName: "worldCup",
      displayName: "JRC World Cup",
      disableSameCarValidation: true,
      maxDriversScoringPointsForTeam: 3,
      clubs: [{ clubId: "397779", championshipIds: ["529964"] }],
      events: [],
      points: {
        powerStage: [],
        overall: []
      },
      manualResults: [],
      cars: [
        "Ford Fiesta R5",
        "ŠKODA Fabia R5",
        "Mitsubishi Space Star R5",
        "Citroën C3 R5",
        "Volkswagen Polo GTI R5",
        "Peugeot 208 T16 R5",
        "Aston Martin V8 Vantage GT4",
        "Ford Mustang GT4",
        "Porsche 911 RGT Rally Spec",
        "Chevrolet Camaro GT4.R",
        "Opel Adam R2",
        "Peugeot 208 R2"
      ]
    }
  }
};

module.exports = initialState;
