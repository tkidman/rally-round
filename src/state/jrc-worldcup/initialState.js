const points = {
  powerStage: [5, 4, 3, 2, 1],
  overall: [
    80,
    74,
    69,
    65,
    61,
    58,
    55,
    52,
    49,
    47,
    45,
    43,
    41,
    39,
    37,
    35,
    34,
    33,
    32,
    31,
    30,
    29,
    28,
    27,
    26,
    25,
    24,
    23,
    22,
    21,
    20,
    19,
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
  // stage: [1]
};

const initialState = {
  pointsForDNF: false,
  websiteName: "jrc-results",
  // subfolderName: "world-cup",
  showLivePoints: true,
  showLivePointsDaysRemaining: 4,
  showCarNameAsTextInResults: true,
  useStandingsForHome: true,
  hideCarColumnInStandings: true,
  useCarAsTeam: false,
  nullTeamIsPrivateer: true,
  // useNationalityAsTeam: true,
  disableOverall: true,
  teamPointsForPowerstage: true,
  incorrectCarTimePenaltySeconds: 120,
  backgroundStyle:
    "background-color: #ffffff;\n" +
    "background-image: url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 200 200'%3E%3Cpolygon fill='%23DCE4FA' fill-opacity='0.36' points='100 0 0 100 100 100 100 200 200 100 200 0'/%3E%3C/svg%3E\");",
  logo: "JRC.png",
  siteTitlePrefix: "JRC World Cup",
  superRallyIsDnf: true,
  showSuperRallyColumn: true,
  divisions: {
    worldCup: {
      divisionName: "worldCup",
      displayName: "World Cup JRC",
      disableSameCarValidation: true,
      maxDriversScoringPointsForTeam: 2,
      wrc: [
        {
          clubId: "20662",
          championshipIds: ["5VogcUotJcMtwq1t1"],
          includeNextChampionships: true
        }
      ],
      events: [],
      points,
      manualResults: []
      // cars: []
    },
    worldCupJRCTeams: {
      divisionName: "worldCupJRCTeams",
      displayName: "World Cup",
      overrideTeam: {
        useNationalityAsTeam: true
      },
      disableSameCarValidation: true,
      maxDriversScoringPointsForTeam: 2,
      hideDriverStandingsLink: true,
      wrc: [
        {
          clubId: "20662",
          championshipIds: ["5VogcUotJcMtwq1t1"],
          includeNextChampionships: true
        }
      ],
      events: [],
      points,
      manualResults: []
      // cars: []
    }
  },
  historicalSeasonLinks: [
    {
      name: "World Cup 1",
      href: "/world-cup/world-cup-1"
    },
    {
      name: "JRC 15",
      href: "/jrc-15"
    },
    {
      name: "JRC 14",
      href: "/jrc-14"
    },
    {
      name: "JRC 13",
      href: "/jrc-13"
    },
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
      href: "/jrc-10"
    },
    {
      name: "JRC 9",
      href: "/jrc-9"
    },
    {
      name: "JRC 8",
      href: "/jrc-8"
    },
    {
      name: "JRC 7",
      href: "/jrc-7"
    },
    {
      name: "JRC 6",
      href: "/jrc-6"
    },
    {
      name: "JRC 5",
      href: "/jrc-5"
    }
  ]
};

module.exports = initialState;
