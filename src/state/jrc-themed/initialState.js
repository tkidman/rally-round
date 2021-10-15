const initialState = {
  pointsForDNF: false,
  websiteName: "jrc-results",
  subfolderName: "themed",
  showLivePoints: false,
  hideCarColumnInStandings: true,
  showCarNameAsTextInResults: false,
  useCarAsTeam: true,
  disableOverall: true,
  teamPointsForPowerstage: false,
  backgroundStyle:
    "background-image: linear-gradient(315deg, #eec0c6 0%, #7ee8fa 74%); background-size: cover; background-repeat: no-repeat; background-attachment: fixed;",
  divisions: {
    wrc2001: {
      divisionName: "wrc2001",
      displayName: "WRC 2001",
      disableSameCarValidation: false,
      maxDriversScoringPointsForTeam: 4,
      filterEntries: true,
      clubs: [
        { clubId: "256173", championshipIds: ["522063"] },
        { clubId: "360961", championshipIds: ["522057"] }
      ],
      manualResults: [
        {
          eventIndex: 0,
          results: [
            {
              name: "Irish_Fox74",
              stageTime: "03:37.627",
              totalTime: "21:11.599",
              isDnfEntry: false,
              vehicleName: "Mitsubishi Lancer Evolution VI"
            }
          ]
        }
      ],
      events: [],
      points: {
        powerStage: [],
        overall: [
          44,
          40,
          37,
          34,
          32,
          30,
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
          1,
          1
        ]
        // stage: [1]
      },
      cars: [
        "Mitsubishi Lancer Evolution VI",
        "Ford Focus RS Rally 2001",
        "Peugeot 206 Rally",
        "SUBARU Impreza (2001)"
      ]
      // outputSheetId: "1C3fU9y1236wFmPuKcui4CEXBuSsUANH6OJ0BpQIasTc"
    }
  }
};
module.exports = initialState;
