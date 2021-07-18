const initialState = {
  pointsForDNF: false,
  websiteName: "jrc-results",
  subfolderName: "themed",
  showLivePoints: false,
  hideCarColumnInStandings: true,
  showCarNameAsTextInResults: true,
  useCarAsTeam: false,
  disableOverall: true,
  teamPointsForPowerstage: true,
  backgroundStyle:
    "background-image: linear-gradient(315deg, #eec0c6 0%, #7ee8fa 74%); background-size: cover; background-repeat: no-repeat; background-attachment: fixed;",
  divisions: {
    vatanen: {
      divisionName: "vatanen",
      displayName: "Ari Vatanen",
      disableSameCarValidation: true,
      clubs: [{ clubId: "256173", championshipIds: ["483002"] }],
      events: [],
      points: {
        powerStage: [],
        overall: [
          44,
          40,
          37,
          34,
          32,
          30,
          28,
          27,
          26,
          25,
          24,
          23,
          22,
          21,
          20,
          19,
          18,
          17,
          16,
          15,
          14,
          13,
          12,
          11,
          10,
          9,
          8,
          7,
          6,
          5,
          4,
          3,
          2,
          1,
          1
        ]
        // stage: [1]
      },
      cars: [
        "Ford Escort Mk II",
        "Opel Manta 400",
        "Peugeot 205 T16 Evo 2",
        "BMW E30 M3 Evo Rally",
        "Subaru Legacy RS"
      ]
      // outputSheetId: "1C3fU9y1236wFmPuKcui4CEXBuSsUANH6OJ0BpQIasTc"
    }
  }
};
module.exports = initialState;
