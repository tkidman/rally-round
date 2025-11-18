const points = {
  powerStage: [3, 2, 1],
  overall: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1] // stage: [1]
};

const initialState = {
  pointsForDNF: false,
  websiteName: "oor-results",
  // subfolderName: "subfolder",
  useStandingsForHome: true,
  showLivePoints: true,
  showLivePointsDaysRemaining: 10,
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
  logo: "OOR.png",
  siteTitlePrefix: "OOR",
  superRallyIsDnf: true,
  showSuperRallyColumn: true,
  divisions: {
    winter: {
      divisionName: "winter",
      displayName: "Winter Season",
      disableSameCarValidation: false,
      // enableSameCarClassValidation: true,
      maxDriversScoringPointsForTeam: 2,
      // filterEntries: true,
      wrc: [
        {
          clubId: "1354",
          championshipIds: ["86pxu6Hu1N7hdnAa"],
          includeNextChampionships: true
        }
      ],
      manualResults: [],
      events: [],
      points
      // excludedCars: ["Builder Vehicle"],
      // cars: [
      //   "Citroën DS3 WRC '12",
      //   "Volkswagen Polo R WRC 2013",
      //   "MINI John Cooper Works WRC"
      // ]
    }
  },
  historicalSeasonLinks: [
    {
      name: "OOR Autumn",
      href: "/oor-3"
    },
    {
      name: "OOR Summer",
      href: "/subfolder/oor-2"
    },
    {
      name: "OOR Winter",
      href: "/oor-1"
    }
  ]
};
module.exports = initialState;
