const initialState = {
  pointsForDNF: false,
  websiteName: "jrc-results",
  subfolderName: "themed",
  showLivePoints: true,
  useCarAsTeam: true,
  divisions: {
    themed: {
      divisionName: "themed",
      displayName: "ERC2",
      clubs: [{ clubId: "256173", championshipIds: ["336914"] }],
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
