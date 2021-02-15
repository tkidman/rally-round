const { JRC_CALCULATIONS } = require("../../fantasy/fantasyFormulas");
// const { privateer } = require("../../shared");

const initialState = {
  pointsForDNF: false,
  websiteName: "jrc-results",
  showLivePoints: false,
  divisions: {
    jrc1: {
      displayName: "JRC",
      divisionName: "jrc1",
      maxDriversScoringPointsForTeam: 2,
      clubs: [
        {
          clubId: "180867",
          championshipIds: ["400958"]
        }
      ],
      events: [],
      points: {
        powerStage: [5, 4, 3, 2, 1],
        overall: [
          35,
          30,
          27,
          24,
          21,
          19,
          17,
          15,
          13,
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
      },
      cars: [
        "SUBARU Impreza 1995",
        "SUBARU Legacy RS",
        "Ford Escort RS Cosworth",
        "Lancia Delta HF Integrale",
        "Mitsubishi Lancer Evolution VI"
      ],
      fantasy: true,
      outputSheetId: "1P-0CJ4rm7xBaMsan0yMcFKwDIWkqjIvYWHNrjgFDixc"
      // relegationZone: 6
    },
    jrc2: {
      displayName: "JRC2",
      divisionName: "jrc2",
      maxDriversScoringPointsForTeam: 2,
      clubs: [
        {
          clubId: "244734",
          championshipIds: ["400980"]
        }
      ],
      events: [],
      points: {
        powerStage: [5, 4, 3, 2, 1],
        overall: [
          35,
          30,
          27,
          24,
          21,
          19,
          17,
          15,
          13,
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
      },
      cars: [
        "SUBARU Impreza (2001)",
        "Ford Focus RS Rally 2001",
        "SUBARU Impreza S4 Rally",
        "Peugeot 206 Rally"
      ],
      outputSheetId: "1WaBmoqfRtXO8CEGhnE2g1b93F5o2Kjh7Nx3vi13U5Tg",
      manualResults: []
      // promotionZone: 7,
      // relegationZone: 8
    },
    jrc3: {
      displayName: "JRC3",
      divisionName: "jrc3",
      maxDriversScoringPointsForTeam: 2,
      clubs: [
        {
          clubId: "330674",
          championshipIds: ["400994"]
        }
      ],
      events: [],
      points: {
        powerStage: [5, 4, 3, 2, 1],
        overall: [
          35,
          30,
          27,
          24,
          21,
          19,
          17,
          15,
          13,
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
      },
      cars: [
        "Mitsubishi Space Star R5",
        "Peugeot 208 T16 R5",
        "Citroën C3 R5",
        "ŠKODA Fabia R5",
        "Ford Fiesta R5",
        "Volkswagen Polo GTI R5"
      ],
      outputSheetId: "1hrpLvoXjZVSjiIWGr1JVTxfAFM-Se83mFntaTcYYY1E"
      // promotionDoubleZone: 1,
      // promotionZone: 7,
      // relegationZone: 8
    },
    jrc4: {
      displayName: "JRC4",
      divisionName: "jrc4",
      maxDriversScoringPointsForTeam: 2,
      clubs: [
        {
          clubId: "342117",
          championshipIds: ["401002"]
        }
      ],
      events: [],
      points: {
        powerStage: [5, 4, 3, 2, 1],
        overall: [
          35,
          30,
          27,
          24,
          21,
          19,
          17,
          15,
          13,
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
      },
      cars: ["Ford Fiesta R2", "Peugeot 208 R2", "Opel Adam R2"]
      // promotionDoubleZone: 1,
      // promotionZone: 6,
      // relegationZone: 8
    },
    jrc5: {
      displayName: "JRC5",
      divisionName: "jrc5",
      maxDriversScoringPointsForTeam: 2,
      clubs: [
        {
          clubId: "357106",
          championshipIds: ["401015"]
        }
      ],
      events: [],
      points: {
        powerStage: [5, 4, 3, 2, 1],
        overall: [
          35,
          30,
          27,
          24,
          21,
          19,
          17,
          15,
          13,
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
      },
      cars: ["Peugeot 205 GTI", "Volkswagen Golf GTI 16V"]
      // promotionDoubleZone: 1,
      // promotionZone: 6
    }
  },
  fantasy: {
    calculators: JRC_CALCULATIONS,
    teams: [],
    driverStandings: {},
    sheetId: "1ifywqh1xfyVjpUqiG1zODpXupbyHwIzVsZCmOvcHtmg"
  },
  visualization: "jrc_all",
  standingsOutputSheetId: "1iLIPjB2fsi3HI5S5CgrvnkEzrdA6fT71m_9zmtL19VI",
  teamOverride: {
    "The Last Son of Hyperborea": [
      "Barrel Rollers Cobras",
      "Barrel Rollers Cobras"
    ]
  }
};

module.exports = initialState;
