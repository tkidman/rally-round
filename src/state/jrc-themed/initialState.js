const initialState = {
  pointsForDNF: false,
  websiteName: "jrc-results",
  subfolderName: "themed",
  showLivePoints: false,
  divisions: {
    themed: {
      divisionName: "themed",
      displayName: "Group B - 1986",
      logo: "colin.jpg",
      clubs: [{ clubId: "256173", championshipIds: ["315039"] }],
      events: [],
      points: {
        powerStage: [],
        overall: [30, 24, 21, 19, 17, 15, 13, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1]
      }
      // outputSheetId: "1C3fU9y1236wFmPuKcui4CEXBuSsUANH6OJ0BpQIasTc"
    }
  }
};

module.exports = initialState;
