const initialState = {
  pointsForDNF: false,
  websiteName: "jrc-results",
  // subfolderName: "worldcup",
  logo: "JRC.png",
  siteTitlePrefix: "JRC",
  useStandingsForHome: true,
  showLivePoints: true,
  showLivePointsDaysRemaining: 4,
  showCarNameAsTextInResults: true,
  hideCarColumnInStandings: false,
  useCarAsTeam: false,
  useNationalityAsTeam: true,
  disableOverall: true,
  teamPointsForPowerstage: false,
  // dropLowestScoringRoundsNumber: 1,
  incorrectCarTimePenaltySeconds: 120,
  backgroundStyle:
    "background-image: linear-gradient(#2193b0, #6dd5ed); background-size: cover; background-repeat: no-repeat; background-attachment: fixed;",
  divisions: {
    worldCup: {
      divisionName: "worldCup",
      displayName: "JRC World Cup",
      disableSameCarValidation: true,
      maxDriversScoringPointsForTeam: 2,
      clubs: [
        {
          clubId: "397779",
          championshipIds: ["655017"],
          includeNextChampionships: true
        }
      ],
      events: [],
      manualResults: [
        {
          eventIndex: 0,
          results: [
            {
              name: "CA_Oisin-Hussey_6",
              stageTime: "07:52.947",
              totalTime: "47:43.750"
            },
            {
              name: "ifBULL",
              stageTime: "08:01.608",
              totalTime: "51:53.064",
              isDnfEntry: false
            }
          ]
        }
      ],
      cars: [
        "Seat Ibiza Kit Car",
        "Volkswagen Golf Kitcar",
        "SUBARU Legacy RS",
        "SUBARU Impreza 1995",
        "Mitsubishi Lancer Evolution VI",
        "Ford Escort RS Cosworth",
        "Renault 5 Turbo",
        "BMW E30 M3 Evo Rally",
        "Opel Ascona 400",
        "Lancia Stratos",
        "Datsun 240Z",
        "Ford Sierra Cosworth RS500"
      ],
      points: {
        powerStage: [5, 4, 3, 2, 1],
        overall: [
          65,
          59,
          55,
          51,
          47,
          44,
          41,
          38,
          36,
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
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          1
        ]
      }
    }
  }
};

module.exports = initialState;
