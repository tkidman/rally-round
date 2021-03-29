const initialState = {
  pointsForDNF: false,
  websiteName: "jrc-results",
  subfolderName: "themed",
  showLivePoints: false,
  // showCarNameAsTextInStandings: true,
  // showCarNameAsTextInResults: true,
  useCarAsTeam: false,
  disableOverall: true,
  teamPointsForPowerstage: true,
  divisions: {
    wrc: {
      divisionName: "jwrc",
      displayName: "JWRC",
      clubs: [{ clubId: "256173", championshipIds: ["432382"] }],
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
        ],
        stage: [1]
      },
      cars: ["Ford Fiesta R2"]
      // outputSheetId: "1C3fU9y1236wFmPuKcui4CEXBuSsUANH6OJ0BpQIasTc"
    }
  }
};

module.exports = initialState;
