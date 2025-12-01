const initialState = {
  pointsForDNF: false,
  websiteName: "jrc-results",
  subfolderName: "acr",
  useStandingsForHome: true,
  showLivePoints: true,
  showLivePointsDaysRemaining: 3,
  hideCarColumnInStandings: true,
  showCarNameAsTextInResults: true,
  hideTeamLogoColumn: true,
  // nullTeamIsPrivateer: true,
  // useCarAsTeam: false,
  // useCarClassAsTeam: true,
  disableOverall: true,
  disableTeams: true,
  teamPointsForPowerstage: false,
  backgroundStyle:
    "background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); background-attachment: fixed;",
  logo: "JRC.png",
  siteTitlePrefix: "JRC ACRally",
  divisions: {
    jrcAcr: {
      divisionName: "jrcAcr",
      displayName: "ACR Season 1",
      disableSameCarValidation: true,
      // enableSameCarClassValidation: true,
      // maxDriversScoringPointsForTeam: 2,
      // filterEntries: true,
      manual: {
        sheetId: "16NMBpzuof5qpctJLhEckplwWj03SAZDDgSC06gpGWkg"
      },
      manualResults: [],
      events: [],
      points: {
        // powerStage: [5, 4, 3, 2, 1],
        overall: [
          30,
          27,
          25,
          23,
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
          1
        ]
        // stage: [1]
      }
      // cars: ["Peugeot 205 GTI"]
      // outputSheetId: "1C3fU9y1236wFmPuKcui4CEXBuSsUANH6OJ0BpQIasTc"
    }
  },
  historicalSeasonLinks: [
    {
      name: "ACR Season 1",
      href: "/acr/acr-1"
    }
  ]
};
module.exports = initialState;
