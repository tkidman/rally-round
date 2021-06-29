const initialState = {
  pointsForDNF: false,
  websiteName: "jrc-results",
  subfolderName: "modern",
  showLivePoints: false,
  showCarNameAsTextInResults: true,
  backgroundStyle:
    "background-image: linear-gradient(#2193b0, #6dd5ed); background-size: cover; background-repeat: no-repeat; background-attachment: fixed;",
  divisions: {
    modern: {
      divisionName: "modern",
      displayName: "JRC Modern",
      disableCarValidation: true,
      clubs: [{ clubId: "387957", championshipIds: ["482738"] }],
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
      },
      manualResults: []
    }
  }
};

module.exports = initialState;
