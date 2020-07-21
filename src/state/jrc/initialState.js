const { JRC_CALCULATIONS } = require("../../fantasy/fantasyFormulas");
var fantasy_teams = require("./fantasyTeams.json");
const initialState = {
  driverSheetId: "1qa1-dLB0vK0dturPflPl4vVQ6twd4i6vFX-88Tyba-Y",
  pointsForDNF: false,
  divisions: {
    jrc1: {
      maxDriversScoringPointsForTeam: 2,
      clubId: "180867",
      championshipIds: ["260543", "267588", "272837", "277620"],
      events: [],
      points: {
        powerStage: [5, 4, 3, 2, 1],
        overall: [30, 24, 21, 19, 17, 15, 13, 11, 9, 7, 5, 4, 3, 2, 1]
      },
      fantasy: true
    },
    jrc2: {
      maxDriversScoringPointsForTeam: 2,
      clubId: "244734",
      championshipIds: ["260546", "267595", "272918", "277730"],
      events: [],
      points: {
        powerStage: [5, 4, 3, 2, 1],
        overall: [30, 24, 21, 19, 17, 15, 13, 11, 9, 7, 5, 4, 3, 2, 1]
      }
    },
    jrc3: {
      maxDriversScoringPointsForTeam: 2,
      clubId: "330674",
      championshipIds: ["260549", "267602", "272991", "277731"],
      events: [],
      points: {
        powerStage: [5, 4, 3, 2, 1],
        overall: [30, 24, 21, 19, 17, 15, 13, 11, 9, 7, 5, 4, 3, 2, 1]
      }
    }
  },
  fantasy: {
    calculators: JRC_CALCULATIONS,
    teams: fantasy_teams,
    driverStandings: {}
  },
  visualization: "jrc_all"
};

module.exports = initialState;
