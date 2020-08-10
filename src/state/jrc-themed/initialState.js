const initialState = {
  pointsForDNF: false,
  divisions: {
    themed: {
      displayName: "Colin McRae Tribute",
      logo: "colin.jpg",
      cars: ["Ford Sierra Cosworth RS500"],
      clubId: "256173",
      championshipIds: ["290761"],
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
