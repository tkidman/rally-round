// eslint-disable-next-line no-unused-vars
const { JRC_CALCULATIONS } = require("../../fantasy/fantasyFormulas");
// const { privateer } = require("../../shared");

const initialState = {
  pointsForDNF: false,
  // websiteName: "jrc-results",
  showLivePoints: true,
  showLivePointsDaysRemaining: 4,
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
          championshipIds: [],
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
        "SUBARU Legacy RS",
        "SUBARU Impreza 1995",
        "Mitsubishi Lancer Evolution VI",
        "Ford Escort RS Cosworth"
      ],
      // fantasy: true,
      outputSheetId: "1P-0CJ4rm7xBaMsan0yMcFKwDIWkqjIvYWHNrjgFDixc",
      manualResults: []
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
          clubId: "180867",
          championshipIds: [],
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
          championshipIds: [],
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
          championshipIds: [],
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
