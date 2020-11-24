const initialState = {
  pointsForDNF: false,
  websiteName: "jrc-results",
  subfolderName: "endurance",
  showLivePoints: false,
  divisions: {
    endurance: {
      divisionName: "endurance",
      displayName: "JRC Endurance",
      clubs: [{ clubId: "353757", championshipIds: ["331780"] }],
      events: [],
      points: {
        powerStage: [15,13,11,9,7,5,4,3,2,1],
        overall: [175,170,165,160,155,150,146,142,138,134,130,127,124,121,118,115,112,109,106,103,100,97,94,81,88,85,82,79,76,73,70,67,64,61,58,55,52,49,46,43,40,37,34,31,28,25,22,19,16,13,10,7,4,1]
      }
    }
  }
};

module.exports = initialState;
