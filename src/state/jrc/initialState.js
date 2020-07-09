const initialState = {
  pointsForDNF: false,
  classes: {
    jrc1: {
      clubId: "180867",
      championshipIds: ["260543", "267588"],
      events: [],
      points: {
        powerStage: [5, 4, 3, 2, 1],
        overall: [30, 24, 21, 19, 17, 15, 13, 11, 9, 7, 5, 4, 3, 2, 1]
      },
      fantasy: true
    },
    jrc2: {
      clubId: "244734",
      championshipIds: ["260546", "267595"],
      events: [],
      points: {
        powerStage: [5, 4, 3, 2, 1],
        overall: [30, 24, 21, 19, 17, 15, 13, 11, 9, 7, 5, 4, 3, 2, 1]
      }
    },
    jrc3: {
      clubId: "330674",
      championshipIds: ["260549", "267602"],
      events: [],
      points: {
        powerStage: [5, 4, 3, 2, 1],
        overall: [30, 24, 21, 19, 17, 15, 13, 11, 9, 7, 5, 4, 3, 2, 1]
      }
    }
  }
};

module.exports = initialState;
