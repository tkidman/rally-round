const { JRC_CALCULATIONS } = require("../../fantasy/fantasyFormulas");
// const { privateer } = require("../../shared");

const initialState = {
  pointsForDNF: false,
  websiteName: "jrc-results",
  showLivePoints: true,
  showLivePointsDaysRemaining: 4,
  enableDnsPenalty: true,
  dropLowestScoringRoundsNumber: 1,
  divisions: {
    jrc1: {
      displayName: "JRC",
      divisionName: "jrc1",
      maxDriversScoringPointsForTeam: 2,
      clubs: [
        {
          clubId: "180867",
          championshipIds: ["472126", "475504"],
          includeNextChampionships: true
        }
      ],
      events: [],
      points: {
        powerStage: [5, 4, 3, 2, 1],
        overall: [30, 24, 21, 19, 17, 15, 13, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1]
      },
      cars: [
        "Audi Sport quattro S1 E2",
        "Peugeot 205 T16 Evo 2",
        "Ford RS200",
        "MG Metro 6R4"
      ],
      fantasy: true,
      outputSheetId: "1P-0CJ4rm7xBaMsan0yMcFKwDIWkqjIvYWHNrjgFDixc",
      manualResults: [
        {
          eventIndex: 1,
          results: [
            {
              name: "Tylacto",
              stageTime: "08:08.349",
              totalTime: "47:07.006"
            }
          ]
        }
      ],
      promotionRelegation: {
        relegationZone: 6
      }
    },
    jrc2: {
      displayName: "JRC2",
      divisionName: "jrc2",
      maxDriversScoringPointsForTeam: 2,
      clubs: [
        {
          clubId: "244734",
          championshipIds: ["472134", "475584"],
          includeNextChampionships: true
        }
      ],
      events: [],
      points: {
        powerStage: [5, 4, 3, 2, 1],
        overall: [30, 24, 21, 19, 17, 15, 13, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1]
      },
      cars: [
        "Mitsubishi Lancer Evolution VI",
        "SUBARU Impreza 1995",
        "SUBARU Legacy RS",
        "Ford Escort RS Cosworth"
      ],
      outputSheetId: "1WaBmoqfRtXO8CEGhnE2g1b93F5o2Kjh7Nx3vi13U5Tg",
      manualResults: [],
      promotionRelegation: {
        promotionZone: 7,
        relegationZone: 7
      }
    },
    jrc3: {
      displayName: "JRC3",
      divisionName: "jrc3",
      maxDriversScoringPointsForTeam: 2,
      clubs: [
        {
          clubId: "330674",
          championshipIds: ["472137", "475585"],
          includeNextChampionships: true
        }
      ],
      events: [],
      points: {
        powerStage: [5, 4, 3, 2, 1],
        overall: [30, 24, 21, 19, 17, 15, 13, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1]
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
              name: "furtif543",
              stageTime: "15:00.000",
              isDnfEntry: true
            }
          ]
        },
        {
          eventIndex: 6,
          results: [
            {
              name: "Greebo62",
              stageTime: "04:03.377",
              totalTime: "47:53.609"
            }
          ]
        }
      ],
      promotionRelegation: {
        promotionZone: 8,
        relegationZone: 8
      }
    },
    jrc4: {
      displayName: "JRC4",
      divisionName: "jrc4",
      maxDriversScoringPointsForTeam: 2,
      clubs: [
        {
          clubId: "342117",
          championshipIds: ["472140"],
          includeNextChampionships: true
        }
      ],
      events: [],
      points: {
        powerStage: [5, 4, 3, 2, 1],
        overall: [30, 24, 21, 19, 17, 15, 13, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1]
      },
      manualResults: [
        {
          eventIndex: 1,
          results: [
            {
              name: "Techo",
              stageTime: "08:56.078",
              totalTime: "57:52.664"
            }
          ]
        },
        {
          eventIndex: 5,
          results: [
            {
              name: "Agersi",
              stageTime: "03:42.527",
              totalTime: "41:36.926"
            }
          ]
        }
      ],
      promotionRelegation: {
        promotionDoubleZone: 1,
        promotionZone: 7,
        relegationZone: 8
      },
      cars: [
        "Citroën C3 R5",
        "Ford Fiesta R5",
        "Mitsubishi Space Star R5",
        "Citroën C3 R5",
        "Peugeot 208 T16 R5",
        "ŠKODA Fabia R5",
        "Volkswagen Polo GTI R5"
      ]
    },
    jrc5: {
      displayName: "JRC5",
      divisionName: "jrc5",
      maxDriversScoringPointsForTeam: 2,
      clubs: [
        {
          clubId: "357106",
          championshipIds: ["472169"],
          includeNextChampionships: true
        }
      ],
      events: [],
      points: {
        powerStage: [5, 4, 3, 2, 1],
        overall: [30, 24, 21, 19, 17, 15, 13, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1]
      },
      cars: ["Opel Adam R2", "Peugeot 208 R2"],
      promotionRelegation: {
        promotionDoubleZone: 1,
        promotionZone: 7,
        relegationZone: 8
      }
    },
    jrc6: {
      displayName: "JRC6",
      divisionName: "jrc6",
      maxDriversScoringPointsForTeam: 2,
      clubs: [
        {
          clubId: "384727",
          championshipIds: ["472151"],
          includeNextChampionships: true
        }
      ],
      events: [],
      points: {
        powerStage: [5, 4, 3, 2, 1],
        overall: [30, 24, 21, 19, 17, 15, 13, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1]
      },
      cars: ["Peugeot 205 GTI", "Volkswagen Golf GTI 16V"],
      promotionRelegation: {
        promotionDoubleZone: 1,
        promotionZone: 8
      }
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
