const { JRC_CALCULATIONS } = require("../../fantasy/fantasyFormulas");
var fantasy_teams = require("./fantasyTeams.json");
const initialState = {
  driverSheetId: "1qa1-dLB0vK0dturPflPl4vVQ6twd4i6vFX-88Tyba-Y",
  pointsForDNF: false,
  divisions: {
    jrc1: {
      maxDriversScoringPointsForTeam: 2,
      clubId: "180867",
      championshipIds: [
        "260543",
        "267588",
        "272837",
        "277620",
        "280989",
        "284559"
      ],
      events: [],
      points: {
        powerStage: [5, 4, 3, 2, 1],
        overall: [30, 24, 21, 19, 17, 15, 13, 11, 9, 7, 5, 4, 3, 2, 1]
      },
      fantasy: true,
      outputSheetId: "1P-0CJ4rm7xBaMsan0yMcFKwDIWkqjIvYWHNrjgFDixc"
    },
    jrc2: {
      maxDriversScoringPointsForTeam: 2,
      clubId: "244734",
      championshipIds: [
        "260546",
        "267595",
        "272918",
        "277730",
        "280996",
        "285214"
      ],
      events: [],
      points: {
        powerStage: [5, 4, 3, 2, 1],
        overall: [30, 24, 21, 19, 17, 15, 13, 11, 9, 7, 5, 4, 3, 2, 1]
      },
      outputSheetId: "1WaBmoqfRtXO8CEGhnE2g1b93F5o2Kjh7Nx3vi13U5Tg"
    },
    jrc3: {
      maxDriversScoringPointsForTeam: 2,
      clubId: "330674",
      championshipIds: [
        "260549",
        "267602",
        "272991",
        "277731",
        "280997",
        "285216"
      ],
      events: [],
      points: {
        powerStage: [5, 4, 3, 2, 1],
        overall: [30, 24, 21, 19, 17, 15, 13, 11, 9, 7, 5, 4, 3, 2, 1]
      },
      outputSheetId: "1hrpLvoXjZVSjiIWGr1JVTxfAFM-Se83mFntaTcYYY1E"
    }
  },
  fantasy: {
    calculators: JRC_CALCULATIONS,
    teams: fantasy_teams,
    driverStandings: {}
  },
  visualization: "jrc_all",
  standingsOutputSheetId: "1iLIPjB2fsi3HI5S5CgrvnkEzrdA6fT71m_9zmtL19VI"
};

module.exports = initialState;
