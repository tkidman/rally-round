const initialState = {
  pointsForDNF: false,
  websiteName: "jrc-results",
  subfolderName: "themed",
  showLivePoints: false,
  useCarAsTeam: true,
  disableOverall: true,
  teamPointsForPowerstage: true,
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
        powerStage: [3, 2, 1],
        overall: [30, 24, 21, 19, 17, 15, 13, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1]
      },
      cars: [
        "Mitsubishi Lancer Evolution VI",
        "SUBARU Impreza S4 Rally",
        "Peugeot 206 Rally",
        "Seat Ibiza Kit Car",
        "Peugeot 306 Maxi",
        "Volkswagen Golf Kitcar"
      ]
      // outputSheetId: "1C3fU9y1236wFmPuKcui4CEXBuSsUANH6OJ0BpQIasTc"
    },
    kitcar: {
      divisionName: "kitcar",
      displayName: "WRC 1999 Kitcar",
      clubs: [{ clubId: "361684", championshipIds: ["362767"] }],
      events: [],
      points: {
        powerStage: [3, 2, 1],
        overall: [30, 24, 21, 19, 17, 15, 13, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1]
      },
      cars: ["Seat Ibiza Kit Car", "Peugeot 306 Maxi", "Volkswagen Golf Kitcar"]
      // outputSheetId: "1C3fU9y1236wFmPuKcui4CEXBuSsUANH6OJ0BpQIasTc"
    }
  }
};

module.exports = initialState;
