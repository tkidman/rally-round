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
  nullTeamIsPrivateer: true,
  enableDnsPenalty: true,
  dnsPenaltyFromFirstRound: true,
  // showCarNameAsTextInResults: true,
  // hideCarColumnInStandings: false,
  // useCarAsTeam: false,
  // useNationalityAsTeam: true,
  // disableOverall: true,
  // teamPointsForPowerstage: false,
  dropLowestScoringRoundsNumber: 1,
  sortByDropRoundPoints: false,
  // incorrectCarTimePenaltySeconds: 120,
  backgroundStyle:
    "background-color: #ffffff;\n" +
    "background-image: url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 2000 1500'%3E%3Cdefs%3E%3Crect stroke='%23ffffff' stroke-width='0.2' width='1' height='1' id='s'/%3E%3Cpattern id='a' width='3' height='3' patternUnits='userSpaceOnUse' patternTransform='scale(16.1) translate(-937.89 -703.42)'%3E%3Cuse fill='%23fcfcfc' href='%23s' y='2'/%3E%3Cuse fill='%23fcfcfc' href='%23s' x='1' y='2'/%3E%3Cuse fill='%23fafafa' href='%23s' x='2' y='2'/%3E%3Cuse fill='%23fafafa' href='%23s'/%3E%3Cuse fill='%23f7f7f7' href='%23s' x='2'/%3E%3Cuse fill='%23f7f7f7' href='%23s' x='1' y='1'/%3E%3C/pattern%3E%3Cpattern id='b' width='7' height='11' patternUnits='userSpaceOnUse' patternTransform='scale(16.1) translate(-937.89 -703.42)'%3E%3Cg fill='%23f5f5f5'%3E%3Cuse href='%23s'/%3E%3Cuse href='%23s' y='5' /%3E%3Cuse href='%23s' x='1' y='10'/%3E%3Cuse href='%23s' x='2' y='1'/%3E%3Cuse href='%23s' x='2' y='4'/%3E%3Cuse href='%23s' x='3' y='8'/%3E%3Cuse href='%23s' x='4' y='3'/%3E%3Cuse href='%23s' x='4' y='7'/%3E%3Cuse href='%23s' x='5' y='2'/%3E%3Cuse href='%23s' x='5' y='6'/%3E%3Cuse href='%23s' x='6' y='9'/%3E%3C/g%3E%3C/pattern%3E%3Cpattern id='h' width='5' height='13' patternUnits='userSpaceOnUse' patternTransform='scale(16.1) translate(-937.89 -703.42)'%3E%3Cg fill='%23f5f5f5'%3E%3Cuse href='%23s' y='5'/%3E%3Cuse href='%23s' y='8'/%3E%3Cuse href='%23s' x='1' y='1'/%3E%3Cuse href='%23s' x='1' y='9'/%3E%3Cuse href='%23s' x='1' y='12'/%3E%3Cuse href='%23s' x='2'/%3E%3Cuse href='%23s' x='2' y='4'/%3E%3Cuse href='%23s' x='3' y='2'/%3E%3Cuse href='%23s' x='3' y='6'/%3E%3Cuse href='%23s' x='3' y='11'/%3E%3Cuse href='%23s' x='4' y='3'/%3E%3Cuse href='%23s' x='4' y='7'/%3E%3Cuse href='%23s' x='4' y='10'/%3E%3C/g%3E%3C/pattern%3E%3Cpattern id='c' width='17' height='13' patternUnits='userSpaceOnUse' patternTransform='scale(16.1) translate(-937.89 -703.42)'%3E%3Cg fill='%23f2f2f2'%3E%3Cuse href='%23s' y='11'/%3E%3Cuse href='%23s' x='2' y='9'/%3E%3Cuse href='%23s' x='5' y='12'/%3E%3Cuse href='%23s' x='9' y='4'/%3E%3Cuse href='%23s' x='12' y='1'/%3E%3Cuse href='%23s' x='16' y='6'/%3E%3C/g%3E%3C/pattern%3E%3Cpattern id='d' width='19' height='17' patternUnits='userSpaceOnUse' patternTransform='scale(16.1) translate(-937.89 -703.42)'%3E%3Cg fill='%23ffffff'%3E%3Cuse href='%23s' y='9'/%3E%3Cuse href='%23s' x='16' y='5'/%3E%3Cuse href='%23s' x='14' y='2'/%3E%3Cuse href='%23s' x='11' y='11'/%3E%3Cuse href='%23s' x='6' y='14'/%3E%3C/g%3E%3Cg fill='%23efefef'%3E%3Cuse href='%23s' x='3' y='13'/%3E%3Cuse href='%23s' x='9' y='7'/%3E%3Cuse href='%23s' x='13' y='10'/%3E%3Cuse href='%23s' x='15' y='4'/%3E%3Cuse href='%23s' x='18' y='1'/%3E%3C/g%3E%3C/pattern%3E%3Cpattern id='e' width='47' height='53' patternUnits='userSpaceOnUse' patternTransform='scale(16.1) translate(-937.89 -703.42)'%3E%3Cg fill='%23DCCFD0'%3E%3Cuse href='%23s' x='2' y='5'/%3E%3Cuse href='%23s' x='16' y='38'/%3E%3Cuse href='%23s' x='46' y='42'/%3E%3Cuse href='%23s' x='29' y='20'/%3E%3C/g%3E%3C/pattern%3E%3Cpattern id='f' width='59' height='71' patternUnits='userSpaceOnUse' patternTransform='scale(16.1) translate(-937.89 -703.42)'%3E%3Cg fill='%23DCCFD0'%3E%3Cuse href='%23s' x='33' y='13'/%3E%3Cuse href='%23s' x='27' y='54'/%3E%3Cuse href='%23s' x='55' y='55'/%3E%3C/g%3E%3C/pattern%3E%3Cpattern id='g' width='139' height='97' patternUnits='userSpaceOnUse' patternTransform='scale(16.1) translate(-937.89 -703.42)'%3E%3Cg fill='%23DCCFD0'%3E%3Cuse href='%23s' x='11' y='8'/%3E%3Cuse href='%23s' x='51' y='13'/%3E%3Cuse href='%23s' x='17' y='73'/%3E%3Cuse href='%23s' x='99' y='57'/%3E%3C/g%3E%3C/pattern%3E%3C/defs%3E%3Crect fill='url(%23a)' width='100%25' height='100%25'/%3E%3Crect fill='url(%23b)' width='100%25' height='100%25'/%3E%3Crect fill='url(%23h)' width='100%25' height='100%25'/%3E%3Crect fill='url(%23c)' width='100%25' height='100%25'/%3E%3Crect fill='url(%23d)' width='100%25' height='100%25'/%3E%3Crect fill='url(%23e)' width='100%25' height='100%25'/%3E%3Crect fill='url(%23f)' width='100%25' height='100%25'/%3E%3Crect fill='url(%23g)' width='100%25' height='100%25'/%3E%3C/svg%3E\");\n" +
    "background-attachment: fixed;\n" +
    "background-size: cover;",
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
  },
  historicalSeasonLinks: [
    {
      name: "JRC 12",
      href: "/jrc-12"
    },
    {
      name: "JRC 11",
      href: "/jrc-11"
    },
    {
      name: "JRC 10",
      href: "jrc-10"
    },
    {
      name: "JRC 9",
      href: "jrc-9"
    },
    {
      name: "JRC 8",
      href: "jrc-8"
    },
    {
      name: "JRC 7",
      href: "jrc-7"
    },
    {
      name: "JRC 6",
      href: "jrc-6"
    },
    {
      name: "JRC 5",
      href: "jrc-5"
    }
  ]
};

module.exports = initialState;
