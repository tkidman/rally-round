const initialState = {
  pointsForDNF: false,
  websiteName: "jrc-results",
  subfolderName: "historic",
  showLivePoints: false,
  divisions: {
    historic: {
      divisionName: "historic",
      displayName: "JRC Historic",
      clubs: [{ clubId: "192069", championshipIds: ["336908"] }],
      events: [],
      points: {
        powerStage: [],
        overall: [30, 24, 21, 19, 17, 15, 13, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1]
      }
    }
  }
};

module.exports = initialState;
