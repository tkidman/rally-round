// eslint-disable-next-line no-unused-vars
// const { privateer } = require("../../shared");

const points = {
  powerStage: [5, 4, 3, 2, 1],
  overall: [
    50,
    44,
    41,
    38,
    35,
    32,
    30,
    28,
    26,
    24,
    22,
    20,
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
    1
  ]
};

const initialState = {
  pointsForDNF: false,
  websiteName: "jrc-results",
  useStandingsForHome: true,
  showLivePoints: true,
  showLivePointsDaysRemaining: 4,
  nullTeamIsPrivateer: false,
  enableDnsPenalty: true,
  dnsPenaltyFromFirstRound: true,
  // showCarNameAsTextInResults: true,
  // hideCarColumnInStandings: false,
  // useCarAsTeam: false,
  // useNationalityAsTeam: true,
  // disableOverall: true,
  // teamPointsForPowerstage: false,
  dropLowestScoringRoundsNumber: 1,
  sortByDropRoundPoints: true,
  // incorrectCarTimePenaltySeconds: 120,
  backgroundStyle:
    "background-image: linear-gradient(to left, #2c3e50, #fd746c); background-size: cover; background-repeat: no-repeat; background-attachment: fixed;",
  logo: "JRC.png",
  siteTitlePrefix: "JRC",
  divisions: {
    jrc1: {
      displayName: "JRC",
      divisionName: "jrc1",
      maxDriversScoringPointsForTeam: 2,
      clubs: [
        {
          clubId: "180867",
          championshipIds: ["675485"],
          includeNextChampionships: true
        },
        {
          clubId: "439038",
          championshipIds: ["675484"],
          includeNextChampionships: true
        }
      ],
      events: [],
      points,
      cars: [
        "Ford Focus RS Rally 2001",
        "Peugeot 206 Rally",
        "SUBARU Impreza (2001)",
        "SUBARU Impreza S4 Rally",
        "Mitsubishi Lancer Evolution VI"
      ],
      manualResults: [],
      filterEntries: {
        matchDivision: true
      }
      // promotionRelegation: {
      //   relegationZone: 7
      // }
    },
    jrc2: {
      displayName: "JRC2",
      divisionName: "jrc2",
      maxDriversScoringPointsForTeam: 2,
      clubs: [
        {
          clubId: "180867",
          championshipIds: ["675485"],
          includeNextChampionships: true
        },
        {
          clubId: "439038",
          championshipIds: ["675484"],
          includeNextChampionships: true
        }
      ],
      events: [],
      points,
      cars: [
        "Ford Focus RS Rally 2001",
        "Peugeot 206 Rally",
        "SUBARU Impreza (2001)",
        "SUBARU Impreza S4 Rally",
        "Mitsubishi Lancer Evolution VI"
      ],
      manualResults: [],
      filterEntries: {
        matchDivision: true
      }
      // promotionRelegation: {
      //   promotionZone: 9,
      //   relegationZone: 8
      // }
    },
    jrc3: {
      displayName: "JRC3",
      divisionName: "jrc3",
      maxDriversScoringPointsForTeam: 2,
      clubs: [
        {
          clubId: "330674",
          championshipIds: ["675483"],
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
      //   promotionZone: 9,
      //   relegationZone: 9
      // }
    },
    jrc4: {
      displayName: "JRC4",
      divisionName: "jrc4",
      maxDriversScoringPointsForTeam: 2,
      clubs: [
        {
          clubId: "342117",
          championshipIds: ["675482"],
          includeNextChampionships: true
        }
      ],
      events: [],
      points,
      manualResults: [],
      // promotionRelegation: {
      //   promotionZone: 12
      // },
      cars: ["Opel Adam R2", "Peugeot 208 R2"]
    }
  }
};

module.exports = initialState;
