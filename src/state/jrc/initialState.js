// eslint-disable-next-line no-unused-vars
const { JRC_CALCULATIONS } = require("../../fantasy/fantasyFormulas");
// const { privateer } = require("../../shared");

const points = {
  powerStage: [5, 4, 3, 2, 1],
  overall: [
    40,
    34,
    31,
    29,
    27,
    25,
    23,
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
};

const initialState = {
  pointsForDNF: false,
  websiteName: "jrc-results",
  showLivePoints: true,
  showLivePointsDaysRemaining: 4,
  nullTeamIsPrivateer: false,
  // enableDnsPenalty: true,
  // dnsPenaltyFromFirstRound: true,
  // dropLowestScoringRoundsNumber: 1,
  // showCarNameAsTextInResults: true,
  // hideCarColumnInStandings: false,
  // useCarAsTeam: false,
  // useNationalityAsTeam: true,
  // disableOverall: true,
  // teamPointsForPowerstage: false,
  // dropLowestScoringRoundsNumber: 1,
  // incorrectCarTimePenaltySeconds: 120,
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
          championshipIds: ["585786"],
          includeNextChampionships: true
        }
      ],
      events: [],
      points,
      cars: [
        "SUBARU Legacy RS",
        "SUBARU Impreza 1995",
        "Mitsubishi Lancer Evolution VI",
        "Ford Escort RS Cosworth"
      ],
      // fantasy: true,
      outputSheetId: "1P-0CJ4rm7xBaMsan0yMcFKwDIWkqjIvYWHNrjgFDixc",
      manualResults: [
        {
          eventIndex: 1,
          results: [
            {
              name: "Irish_Fox74",
              totalTime: "42:06.260"
            }
          ]
        }
      ]
      // filterEntries: {
      //   matchDivision: true
      // },
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
          clubId: "244734",
          championshipIds: ["585492"],
          includeNextChampionships: true
        }
      ],
      events: [],
      points,
      cars: [
        "Ford Focus RS Rally 2001",
        "Peugeot 206 Rally",
        "SUBARU Impreza (2001)",
        "SUBARU Impreza S4 Rally"
      ],
      outputSheetId: "1WaBmoqfRtXO8CEGhnE2g1b93F5o2Kjh7Nx3vi13U5Tg",
      manualResults: []
      // filterEntries: {
      //   matchDivision: true
      // },
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
          championshipIds: ["585477"],
          includeNextChampionships: true
        }
      ],
      events: [],
      points,
      cars: [
        "Ford Fiesta R5",
        "ŠKODA Fabia R5",
        "Mitsubishi Space Star R5",
        "Citroën C3 R5",
        "Volkswagen Polo GTI R5",
        "Peugeot 208 T16 R5"
      ],
      manualResults: []
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
          championshipIds: ["585507"],
          includeNextChampionships: true
        }
      ],
      events: [],
      points,
      manualResults: [
        {
          eventIndex: 4,
          results: [
            {
              name: "BuckyMcBuckster",
              stageTime: "06:50.366",
              totalTime: "00:46:08.907"
            }
          ]
        }
      ],
      // promotionRelegation: {
      //   promotionDoubleZone: 1,
      //   promotionZone: 7,
      //   relegationZone: 8
      // },
      cars: ["Opel Adam R2", "Peugeot 208 R2"]
      // fantasy: true
    }
  }
  // fantasy: {
  //   calculators: JRC_CALCULATIONS,
  //   teams: [],
  //   driverStandings: {},
  //   sheetId: "1ifywqh1xfyVjpUqiG1zODpXupbyHwIzVsZCmOvcHtmg"
  // },
  // standingsOutputSheetId: "1iLIPjB2fsi3HI5S5CgrvnkEzrdA6fT71m_9zmtL19VI"
};

module.exports = initialState;
