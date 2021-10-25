const initialState = {
  pointsForDNF: false,
  websiteName: "jrc-results",
  // subfolderName: "worldcup",
  showLivePoints: true,
  showLivePointsDaysRemaining: 4,
  showCarNameAsTextInResults: true,
  hideCarColumnInStandings: false,
  useCarAsTeam: false,
  useNationalityAsTeam: true,
  disableOverall: true,
  teamPointsForPowerstage: false,
  incorrectCarTimePenaltySeconds: 120,
  backgroundStyle:
    "background-image: linear-gradient(#2193b0, #6dd5ed); background-size: cover; background-repeat: no-repeat; background-attachment: fixed;",
  divisions: {
    worldCup: {
      divisionName: "worldCup",
      displayName: "JRC World Cup",
      disableSameCarValidation: true,
      maxDriversScoringPointsForTeam: 3,
      clubs: [{ clubId: "397779", championshipIds: ["529964"] }],
      events: [],
      manualResults: [
        {
          eventIndex: 0,
          results: [
            {
              name: "valuson",
              stageTime: "08:50.929",
              totalTime: "56:09.257",
              isDnfEntry: false
            }
          ]
        }
      ],
      cars: [
        "Ford Fiesta R5",
        "ŠKODA Fabia R5",
        "Mitsubishi Space Star R5",
        "Citroën C3 R5",
        "Volkswagen Polo GTI R5",
        "Peugeot 208 T16 R5",
        "Aston Martin V8 Vantage GT4",
        "Ford Mustang GT4",
        "Porsche 911 RGT Rally Spec",
        "Chevrolet Camaro GT4.R",
        "Opel Adam R2",
        "Peugeot 208 R2"
      ],
      points: {
        powerStage: [5, 4, 3, 2, 1],
        overall: [
          80,
          74,
          69,
          65,
          61,
          58,
          55,
          52,
          49,
          47,
          45,
          43,
          41,
          39,
          37,
          35,
          34,
          33,
          32,
          31,
          30,
          29,
          28,
          27,
          26,
          25,
          24,
          23,
          22,
          21,
          20,
          19,
          18,
          17,
          16,
          15,
          14,
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
          1
        ]
      }
    }
  }
};

module.exports = initialState;
