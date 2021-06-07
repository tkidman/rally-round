const initialState = {
  pointsForDNF: false,
  // websiteName: "jrc-results",
  subfolderName: "birthday",
  showLivePoints: false,
  showCarNameAsTextInStandings: true,
  showCarNameAsTextInResults: true,
  useCarAsTeam: false,
  disableOverall: true,
  teamPointsForPowerstage: false,
  divisions: {
    combined: {
      divisionName: "R5R2",
      displayName: "JRC Birthday R5 & R2",
      clubs: [
        { clubId: "380356", championshipIds: ["459508"] },
        { clubId: "380357", championshipIds: ["459507"] }
      ],
      events: [],
      points: {
        overall: []
      },
      cars: [
        "Citroën C3 R5",
        "Ford Fiesta R5",
        "Mitsubishi Space Star R5",
        "Citroën C3 R5",
        "Peugeot 208 T16 R5",
        "ŠKODA Fabia R5",
        "Volkswagen Polo GTI R5",
        "Opel Adam R2",
        "Peugeot 208 R2"
      ]
    },
    r2: {
      divisionName: "R2",
      displayName: "JRC Birthday R2",
      clubs: [{ clubId: "380357", championshipIds: ["459507"] }],
      events: [],
      points: {
        overall: []
      },
      cars: ["Opel Adam R2", "Peugeot 208 R2"]
    }
  }
};

module.exports = initialState;
