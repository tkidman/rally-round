// eslint-disable-next-line no-unused-vars
const { JRC_CALCULATIONS } = require("../../fantasy/fantasyFormulas");
// const { privateer } = require("../../shared");

const initialState = {
  pointsForDNF: false,
  websiteName: "jrc-results",
  showLivePoints: true,
  showLivePointsDaysRemaining: 4,
  // enableDnsPenalty: true,
  // dropLowestScoringRoundsNumber: 1,
  backgroundStyle:
    "background-image: linear-gradient(to left, #2c3e50, #fd746c); background-size: cover; background-repeat: no-repeat; background-attachment: fixed;",
  divisions: {
    jrc1: {
      displayName: "JRC",
      divisionName: "jrc1",
      maxDriversScoringPointsForTeam: 2,
      clubs: [
        {
          clubId: "180867",
          championshipIds: ["504147"],
          includeNextChampionships: true
        }
      ],
      events: [],
      points: {
        powerStage: [5, 4, 3, 2, 1],
        overall: [
          30,
          24,
          21,
          19,
          17,
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
      },
      cars: [
        "Ford Fiesta R5",
        "ŠKODA Fabia R5",
        "Mitsubishi Space Star R5",
        "Citroën C3 R5",
        "Volkswagen Polo GTI R5",
        "Peugeot 208 T16 R5"
      ],
      // fantasy: true,
      outputSheetId: "1P-0CJ4rm7xBaMsan0yMcFKwDIWkqjIvYWHNrjgFDixc",
      manualResults: [
        {
          eventIndex: 2,
          results: [
            {
              name: "BrothersChris",
              totalTime: "40:55.887"
            }
          ]
        },
        {
          eventIndex: 3,
          results: [
            {
              name: "satchmo",
              totalTime: "41:05.083"
            }
          ]
        }
      ],
      filterEntries: {
        matchDivision: true
      }
      // promotionRelegation: {
      //   relegationZone: 6
      // }
    },
    jrc2: {
      displayName: "JRC2",
      divisionName: "jrc2",
      maxDriversScoringPointsForTeam: 2,
      clubs: [
        {
          clubId: "180867",
          championshipIds: ["504147"],
          includeNextChampionships: true
        }
      ],
      events: [],
      points: {
        powerStage: [5, 4, 3, 2, 1],
        overall: [
          30,
          24,
          21,
          19,
          17,
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
      },
      cars: [
        "Ford Fiesta R5",
        "ŠKODA Fabia R5",
        "Mitsubishi Space Star R5",
        "Citroën C3 R5",
        "Volkswagen Polo GTI R5",
        "Peugeot 208 T16 R5"
      ],
      outputSheetId: "1WaBmoqfRtXO8CEGhnE2g1b93F5o2Kjh7Nx3vi13U5Tg",
      manualResults: [
        {
          eventIndex: 1,
          results: [
            {
              name: "Chaosinterface",
              totalTime: "41:52.095"
            }
          ]
        }
      ],
      filterEntries: {
        matchDivision: true
      }
      // promotionRelegation: {
      //   promotionZone: 7,
      //   relegationZone: 7
      // }
    },
    jrc3: {
      displayName: "JRC3",
      divisionName: "jrc3",
      maxDriversScoringPointsForTeam: 2,
      clubs: [
        {
          clubId: "330674",
          championshipIds: ["504148"],
          includeNextChampionships: true
        }
      ],
      events: [],
      points: {
        powerStage: [5, 4, 3, 2, 1],
        overall: [
          30,
          24,
          21,
          19,
          17,
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
      },
      cars: [
        "Ford Focus RS Rally 2001",
        "Peugeot 206 Rally",
        "SUBARU Impreza (2001)",
        "SUBARU Impreza S4 Rally"
      ],
      outputSheetId: "1hrpLvoXjZVSjiIWGr1JVTxfAFM-Se83mFntaTcYYY1E",
      manualResults: [
        {
          eventIndex: 0,
          results: [
            {
              name: "Revi ★",
              totalTime: "49:02.697"
            }
          ]
        }
      ]
      // promotionRelegation: {
      //   promotionZone: 8,
      //   relegationZone: 8
      // }
    },
    jrc4: {
      displayName: "JRC4",
      divisionName: "jrc4",
      maxDriversScoringPointsForTeam: 2,
      clubs: [
        {
          clubId: "342117",
          championshipIds: ["504150"],
          includeNextChampionships: true
        }
      ],
      events: [],
      points: {
        powerStage: [5, 4, 3, 2, 1],
        overall: [
          30,
          24,
          21,
          19,
          17,
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
      },
      manualResults: [],
      // promotionRelegation: {
      //   promotionDoubleZone: 1,
      //   promotionZone: 7,
      //   relegationZone: 8
      // },
      cars: ["Mitsubishi Lancer Evolution X", "SUBARU WRX STI NR4"],
      fantasy: true
    },
    jrc5: {
      displayName: "JRC5",
      divisionName: "jrc5",
      maxDriversScoringPointsForTeam: 2,
      clubs: [
        {
          clubId: "357106",
          championshipIds: ["504151"],
          includeNextChampionships: true
        }
      ],
      events: [],
      points: {
        powerStage: [5, 4, 3, 2, 1],
        overall: [
          30,
          24,
          21,
          19,
          17,
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
      },
      cars: ["Opel Adam R2", "Peugeot 208 R2"]
      // promotionRelegation: {
      //   promotionDoubleZone: 1,
      //   promotionZone: 7,
      //   relegationZone: 8
      // }
    }
  },
  fantasy: {
    calculators: JRC_CALCULATIONS,
    teams: [],
    driverStandings: {},
    sheetId: "1ifywqh1xfyVjpUqiG1zODpXupbyHwIzVsZCmOvcHtmg"
  },
  standingsOutputSheetId: "1iLIPjB2fsi3HI5S5CgrvnkEzrdA6fT71m_9zmtL19VI"
};

module.exports = initialState;
