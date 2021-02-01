const initialState = {
  pointsForDNF: false,
  websiteName: "jrc-results",
  subfolderName: "endurance",
  showLivePoints: true,
  divisions: {
    endurance: {
      divisionName: "endurance",
      displayName: "JRC Endurance",
      disableCarValidation: true,
      clubs: [{ clubId: "353757", championshipIds: ["378332"] }],
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
