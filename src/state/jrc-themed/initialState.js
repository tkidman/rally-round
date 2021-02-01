const initialState = {
  pointsForDNF: false,
  websiteName: "jrc-results",
  subfolderName: "themed",
  showLivePoints: true,
  showCarNameAsTextInStandings: true,
  showCarNameAsTextInResults: true,
  useCarAsTeam: true,
  disableOverall: true,
  teamPointsForPowerstage: true,
  divisions: {
    wrc: {
      divisionName: "wrc",
      displayName: "WRC 2008",
      clubs: [{ clubId: "256173", championshipIds: ["396882"] }],
      events: [],
      points: {
        powerStage: [],
        overall: [
          35,
          32,
          29,
          27,
          25,
          23,
          21,
          19,
          17,
          15,
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
          1,
          1
        ]
      },
      cars: ["Citroën C4 Rally", "SUBARU Impreza", "Ford Focus RS Rally 2007"]
      // outputSheetId: "1C3fU9y1236wFmPuKcui4CEXBuSsUANH6OJ0BpQIasTc"
    }
  }
};

module.exports = initialState;
