const initialState = {
  pointsForDNF: false,
  websiteName: "jrc-results",
  subfolderName: "wrc",
  useStandingsForHome: true,
  showLivePoints: true,
  showLivePointsDaysRemaining: 3,
  hideCarColumnInStandings: false,
  showCarNameAsTextInResults: false,
  nullTeamIsPrivateer: true,
  // useCarAsTeam: false,
  // useCarClassAsTeam: true,
  disableOverall: true,
  teamPointsForPowerstage: true,
  backgroundStyle:
    "background-image: linear-gradient(315deg, #eec0c6 0%, #7ee8fa 74%); background-size: cover; background-repeat: no-repeat; background-attachment: fixed;",
  logo: "JRC.png",
  siteTitlePrefix: "JRC WRC",
  divisions: {
    jrcWrc: {
      divisionName: "wrcSeason5",
      displayName: "WRC Season 5",
      disableSameCarValidation: false,
      // enableSameCarClassValidation: true,
      maxDriversScoringPointsForTeam: 2,
      // filterEntries: true,
      manual: {
        sheetId: "1IpbqdDUJCijNzeRM9lsqP1jwutbVug1JdZ-LH8tQM9M"
      },
      manualResults: [],
      events: [],
      points: {
        powerStage: [5, 4, 3, 2, 1],
        overall: [
          30, 24, 21, 19, 17, 15, 13, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 1, 1,
          1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1
        ]
        // stage: [1]
      }
      // cars: ["Peugeot 205 GTI"]
      // outputSheetId: "1C3fU9y1236wFmPuKcui4CEXBuSsUANH6OJ0BpQIasTc"
    }
  },
  historicalSeasonLinks: [
    {
      name: "WRC Season 1",
      href: "/wrc/wrc-1"
    },
    {
      name: "WRC Season 2",
      href: "/wrc/wrc-2"
    },
    {
      name: "WRC Season 3",
      href: "/wrc/wrc-3"
    },
    {
      name: "WRC Season 4",
      href: "/wrc/wrc-4"
    }
  ]
};
module.exports = initialState;
