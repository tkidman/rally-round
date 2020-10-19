const { JRC_CALCULATIONS } = require("../../fantasy/fantasyFormulas");

// Current       27 30  26   30 = 113 , 28,25
// promotion   -    6  1+5  1+6
// demotion     6   7    5      -
// New             28 29 28   28

const initialState = {
  driverSheetId: "1qa1-dLB0vK0dturPflPl4vVQ6twd4i6vFX-88Tyba-Y",
  pointsForDNF: false,
  websiteName: "jrc-results",
  showLivePoints: true,
  divisions: {
    jrc1: {
      displayName: "JRC",
      divisionName: "jrc1",
      maxDriversScoringPointsForTeam: 2,
      clubs: [
        {
          clubId: "180867",
          championshipIds: [
            "307328",
            "310674",
            "313159",
            "317631",
            "320939",
            "325024"
          ]
        },
        {
          clubId: "342498",
          championshipIds: [
            "307333",
            "310677",
            "313222",
            "317634",
            "320940",
            "325042"
          ]
        }
      ],
      events: [],
      points: {
        powerStage: [5, 4, 3, 2, 1],
        overall: [30, 24, 21, 19, 17, 15, 13, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1]
      },
      fantasy: true,
      outputSheetId: "1P-0CJ4rm7xBaMsan0yMcFKwDIWkqjIvYWHNrjgFDixc",
      manualResults: [],
      relegationZone: 6
    },
    jrc2: {
      displayName: "JRC2",
      divisionName: "jrc2",
      maxDriversScoringPointsForTeam: 2,
      clubs: [
        {
          clubId: "244734",
          championshipIds: [
            "307342",
            "310678",
            "313264",
            "317635",
            "320942",
            "325336"
          ]
        }
      ],
      events: [],
      points: {
        powerStage: [5, 4, 3, 2, 1],
        overall: [30, 24, 21, 19, 17, 15, 13, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1]
      },
      outputSheetId: "1WaBmoqfRtXO8CEGhnE2g1b93F5o2Kjh7Nx3vi13U5Tg",
      manualResults: [{
        'eventId': "326004",
        'results': [
          {
            'name': "The Last Son of Hyperborea",
            'stageTime': "03:08.006",
            'totalTime': "40:05.824",
            'totalDiff': "+00:47.748",
            'stageDiff': "+00:05.027"
          }
        ]
      }],
      promotionZone: 6,
      relegationZone: 7
    },
    jrc3: {
      displayName: "JRC3",
      divisionName: "jrc3",
      maxDriversScoringPointsForTeam: 2,
      clubs: [
        {
          clubId: "330674",
          championshipIds: [
            "307343",
            "310679",
            "313274",
            "317636",
            "320943",
            "325356"
          ]
        }
      ],
      events: [],
      points: {
        powerStage: [5, 4, 3, 2, 1],
        overall: [30, 24, 21, 19, 17, 15, 13, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1]
      },
      outputSheetId: "1hrpLvoXjZVSjiIWGr1JVTxfAFM-Se83mFntaTcYYY1E",
      promotionDoubleZone: 1,
      promotionZone: 5,
      relegationZone: 5
    },
    jrc4: {
      displayName: "JRC4",
      divisionName: "jrc4",
      maxDriversScoringPointsForTeam: 2,
      clubs: [
        {
          clubId: "342117",
          championshipIds: [
            "307345",
            "310680",
            "313290",
            "317637",
            "320947",
            "325361"
          ]
        }
      ],
      events: [],
      points: {
        powerStage: [5, 4, 3, 2, 1],
        overall: [30, 24, 21, 19, 17, 15, 13, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1]
      },
      promotionDoubleZone: 1,
      promotionZone: 6
    }
  },
  fantasy: {
    calculators: JRC_CALCULATIONS,
    teams: [],
    driverStandings: {},
    sheetId: "1ifywqh1xfyVjpUqiG1zODpXupbyHwIzVsZCmOvcHtmg"
  },
  visualization: "jrc_all",
  standingsOutputSheetId: "1iLIPjB2fsi3HI5S5CgrvnkEzrdA6fT71m_9zmtL19VI"
};

module.exports = initialState;
