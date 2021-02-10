const initialState = {
  pointsForDNF: false,
  websiteName: "jrc-results",
  subfolderName: "historic",
  showLivePoints: false,
  showCarNameAsTextInResults: true,
  divisions: {
    historic: {
      divisionName: "historic",
      displayName: "JRC Historic",
      disableCarValidation: true,
      clubs: [{ clubId: "192069", championshipIds: ["395317"] }],
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
      manualResults: [
        {
          eventId: "396036",
          results: [
            {
              name: "ERIKSSON Torbjörn",
              stageTime: "03:34.008",
              stageDiff: "+00:03.250",
              totalTime: "22:12.500",
              totalDiff: "+00:07.170"
            }
          ]
        }
      ]
    }
  }
};

module.exports = initialState;
