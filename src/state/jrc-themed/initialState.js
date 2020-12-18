const initialState = {
  pointsForDNF: false,
  websiteName: "jrc-results",
  subfolderName: "themed",
  showLivePoints: true,
  useCarAsTeam: true,
  disableOverall: true,
  divisions: {
    wrc: {
      divisionName: "wrc",
      displayName: "WRC 1999",
      clubs: [
        { clubId: "256173", championshipIds: ["362744"] },
        { clubId: "360961", championshipIds: ["362738"] },
        { clubId: "361684", championshipIds: ["362767"] }
      ],
      events: [],
      points: {
        powerStage: [],
        overall: [30, 24, 21, 19, 17, 15, 13, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1]
      }
      // outputSheetId: "1C3fU9y1236wFmPuKcui4CEXBuSsUANH6OJ0BpQIasTc"
    },
    kitcar: {
      divisionName: "kitcar",
      displayName: "WRC 1999 Kitcar",
      clubs: [{ clubId: "361684", championshipIds: ["362767"] }],
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
