// const { JRC_CALCULATIONS } = require("../../fantasy/fantasyFormulas");
// const { privateer } = require("../../shared");

const initialState = {
  pointsForDNF: false,
  websiteName: "jrc-results",
  showLivePoints: true,
  showLivePointsDaysRemaining: 4,
  divisions: {
    jrc1: {
      displayName: "JRC",
      divisionName: "jrc1",
      maxDriversScoringPointsForTeam: 2,
      clubs: [
        {
          clubId: "180867",
          championshipIds: ["472126"],
          includeNextChampionships: true
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
      // cars: [],
      fantasy: true,
      outputSheetId: "1P-0CJ4rm7xBaMsan0yMcFKwDIWkqjIvYWHNrjgFDixc",
      manualResults: []
      // relegationZone: 6
    },
    jrc2: {
      displayName: "JRC2",
      divisionName: "jrc2",
      maxDriversScoringPointsForTeam: 2,
      clubs: [
        {
          clubId: "244734",
          championshipIds: ["472134"],
          includeNextChampionships: true
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
      // cars: [],
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
          championshipIds: ["472137"],
          includeNextChampionships: true
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
      // cars: [],
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
          championshipIds: ["472140"],
          includeNextChampionships: true
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
      manualResults: []
      // cars: []
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
          championshipIds: ["472169"],
          includeNextChampionships: true
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
      }
      // cars: []
      // promotionDoubleZone: 1,
      // promotionZone: 6
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
      }
      // cars: []
      // promotionDoubleZone: 1,
      // promotionZone: 6
    }
  },
  // fantasy: {
  //   calculators: JRC_CALCULATIONS,
  //   teams: [],
  //   driverStandings: {},
  //   sheetId: "1ifywqh1xfyVjpUqiG1zODpXupbyHwIzVsZCmOvcHtmg"
  // },
  standingsOutputSheetId: "1iLIPjB2fsi3HI5S5CgrvnkEzrdA6fT71m_9zmtL19VI"
};

module.exports = initialState;
