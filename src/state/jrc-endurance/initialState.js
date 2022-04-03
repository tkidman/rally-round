const initialState = {
  pointsForDNF: false,
  websiteName: "jrc-results",
  subfolderName: "endurance",
  showLivePoints: false,
  showCarNameAsTextInResults: true,
  logo: "JRC.png",
  siteTitlePrefix: "JRC",
  divisions: {
    endurance: {
      divisionName: "endurance",
      displayName: "JRC Endurance",
      disableSameCarValidation: true,
      clubs: [
        {
          clubId: "353757",
          championshipIds: ["472591"],
          includeNextChampionships: true
        }
      ],
      // cars: [
      //   "Ford Focus RS Rally 2001",
      //   "Peugeot 206 Rally",
      //   "SUBARU Impreza (2001)",
      //   "SUBARU Impreza S4 Rally"
      // ],
      events: [],
      points: {
        powerStage: [6, 5, 4, 3, 2, 1],
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
      }
    }
  }
};

module.exports = initialState;
