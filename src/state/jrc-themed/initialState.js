const initialState = {
  pointsForDNF: false,
  websiteName: "jrc-results",
  subfolderName: "themed",
  useStandingsForHome: true,
  showLivePoints: false,
  showLivePointsDaysRemaining: 4,
  hideCarColumnInStandings: false,
  showCarNameAsTextInResults: true,
  nullTeamIsPrivateer: true,
  useCarAsTeam: false,
  // useCarClassAsTeam: false,
  disableOverall: true,
  // teamPointsForPowerstage: false,
  backgroundStyle:
    "background-color: #FEFFFF;\n" +
    "background-image: url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1600 900'%3E%3Cpolygon fill='%23b6cbcb' points='957 450 539 900 1396 900'/%3E%3Cpolygon fill='%23ebcdef' points='957 450 872.9 900 1396 900'/%3E%3Cpolygon fill='%23acc3c8' points='-60 900 398 662 816 900'/%3E%3Cpolygon fill='%23ebc6dd' points='337 900 398 662 816 900'/%3E%3Cpolygon fill='%23a4bbc5' points='1203 546 1552 900 876 900'/%3E%3Cpolygon fill='%23e6c1cd' points='1203 546 1552 900 1162 900'/%3E%3Cpolygon fill='%239eb3c2' points='641 695 886 900 367 900'/%3E%3Cpolygon fill='%23debdc0' points='587 900 641 695 886 900'/%3E%3Cpolygon fill='%239baabd' points='1710 900 1401 632 1096 900'/%3E%3Cpolygon fill='%23d2b9b6' points='1710 900 1401 632 1365 900'/%3E%3Cpolygon fill='%239aa0b7' points='1210 900 971 687 725 900'/%3E%3Cpolygon fill='%23c6b6b0' points='943 900 1210 900 971 687'/%3E%3C/svg%3E\");\n" +
    "background-attachment: fixed;\n" +
    "background-size: cover;",
  logo: "JRC.png",
  siteTitlePrefix: "JRC Themed",
  divisions: {
    wrc1976: {
      divisionName: "wrc1976",
      displayName: "WRC 1976",
      disableSameCarValidation: false,
      // enableSameCarClassValidation: true,
      maxDriversScoringPointsForTeam: 2,
      // filterEntries: true,
      clubs: [
        { clubId: "256173", championshipIds: ["755129"] },
        { clubId: "360961", championshipIds: ["755134"] }
      ],
      manualResults: [],
      events: [],
      points: {
        powerStage: [],
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
      },
      cars: [
        "Opel Kadett C GT/E",
        "Ford Escort Mk II",
        "Fiat 131 Abarth Rally",
        "Lancia Stratos"
      ]
      // outputSheetId: "1C3fU9y1236wFmPuKcui4CEXBuSsUANH6OJ0BpQIasTc"
    }
  },
  historicalSeasonLinks: [
    {
      name: "Craig Breen Tribute",
      href: "/themed/themed-13"
    },
    {
      name: "WRC 2001",
      href: "/themed/themed-12"
    },
    {
      name: "Ken Block Tribute",
      href: "/themed/themed-11"
    },
    {
      name: "Peugeot Rally Challenge",
      href: "/themed/themed-10"
    },
    {
      name: "FWD vs RWD",
      href: "/themed/themed-9"
    },
    {
      name: "WRC 2001",
      href: "/themed/themed-8"
    },
    {
      name: "WRC2",
      href: "/themed/themed-7"
    },
    {
      name: "Ari Vatanen",
      href: "/themed/themed-6"
    },
    {
      name: "JWRC",
      href: "/themed/themed-5"
    },
    {
      name: "WRC 2008",
      href: "/themed/themed-4"
    },
    {
      name: "WRC 1999",
      href: "/themed/themed-3"
    },
    {
      name: "Themed 2020/12",
      href: "/themed/themed-2"
    },
    {
      name: "Themed 2020/11",
      href: "/themed/themed-1"
    }
  ]
};
module.exports = initialState;
