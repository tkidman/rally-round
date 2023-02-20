const initialState = {
  pointsForDNF: false,
  websiteName: "jrc-results",
  subfolderName: "rbr",
  useStandingsForHome: true,
  showLivePoints: false,
  showLivePointsDaysRemaining: 4,
  hideCarColumnInStandings: false,
  showCarNameAsTextInResults: false,
  nullTeamIsPrivateer: true,
  // dropLowestScoringRoundsNumber: 1,
  // sortByDropRoundPoints: true,
  // useCarAsTeam: false,
  // useCarClassAsTeam: true,
  disableOverall: true,
  hideStageTimesUntilEventEnd: true,
  // teamPointsForPowerstage: true,
  backgroundStyle:
    "background-color: #CCCACB;\n" +
    "background-image: url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' viewBox='0 0 100 60'%3E%3Cg fill-opacity='0.95'%3E%3Crect fill='%23CCCACB' width='11' height='11'/%3E%3Crect fill='%23cdcbcc' x='10' width='11' height='11'/%3E%3Crect fill='%23cdcbcc' y='10' width='11' height='11'/%3E%3Crect fill='%23cecccd' x='20' width='11' height='11'/%3E%3Crect fill='%23cecccd' x='10' y='10' width='11' height='11'/%3E%3Crect fill='%23cfcdce' y='20' width='11' height='11'/%3E%3Crect fill='%23cfcdce' x='30' width='11' height='11'/%3E%3Crect fill='%23d0cecf' x='20' y='10' width='11' height='11'/%3E%3Crect fill='%23d1cfcf' x='10' y='20' width='11' height='11'/%3E%3Crect fill='%23d1cfd0' y='30' width='11' height='11'/%3E%3Crect fill='%23d2d0d0' x='40' width='11' height='11'/%3E%3Crect fill='%23d2d0d1' x='30' y='10' width='11' height='11'/%3E%3Crect fill='%23d3d1d2' x='20' y='20' width='11' height='11'/%3E%3Crect fill='%23d3d1d2' x='10' y='30' width='11' height='11'/%3E%3Crect fill='%23d4d2d3' y='40' width='11' height='11'/%3E%3Crect fill='%23d5d3d3' x='50' width='11' height='11'/%3E%3Crect fill='%23d5d3d4' x='40' y='10' width='11' height='11'/%3E%3Crect fill='%23d6d4d4' x='30' y='20' width='11' height='11'/%3E%3Crect fill='%23d6d4d5' x='20' y='30' width='11' height='11'/%3E%3Crect fill='%23d7d5d5' x='10' y='40' width='11' height='11'/%3E%3Crect fill='%23d8d5d6' y='50' width='11' height='11'/%3E%3Crect fill='%23d8d6d7' x='60' width='11' height='11'/%3E%3Crect fill='%23d9d7d7' x='50' y='10' width='11' height='11'/%3E%3Crect fill='%23d9d7d8' x='40' y='20' width='11' height='11'/%3E%3Crect fill='%23dad8d8' x='30' y='30' width='11' height='11'/%3E%3Crect fill='%23dad8d9' x='20' y='40' width='11' height='11'/%3E%3Crect fill='%23dbd9d9' x='10' y='50' width='11' height='11'/%3E%3Crect fill='%23dcd9da' x='70' width='11' height='11'/%3E%3Crect fill='%23dcdada' x='60' y='10' width='11' height='11'/%3E%3Crect fill='%23dddbdb' x='50' y='20' width='11' height='11'/%3E%3Crect fill='%23dddbdc' x='40' y='30' width='11' height='11'/%3E%3Crect fill='%23dedcdc' x='30' y='40' width='11' height='11'/%3E%3Crect fill='%23dedcdd' x='20' y='50' width='11' height='11'/%3E%3Crect fill='%23dfdddd' x='80' width='11' height='11'/%3E%3Crect fill='%23e0ddde' x='70' y='10' width='11' height='11'/%3E%3Crect fill='%23e0dede' x='60' y='20' width='11' height='11'/%3E%3Crect fill='%23e1dfdf' x='50' y='30' width='11' height='11'/%3E%3Crect fill='%23e1dfe0' x='40' y='40' width='11' height='11'/%3E%3Crect fill='%23e2e0e0' x='30' y='50' width='11' height='11'/%3E%3Crect fill='%23e2e0e1' x='90' width='11' height='11'/%3E%3Crect fill='%23e3e1e1' x='80' y='10' width='11' height='11'/%3E%3Crect fill='%23e4e2e2' x='70' y='20' width='11' height='11'/%3E%3Crect fill='%23e4e2e2' x='60' y='30' width='11' height='11'/%3E%3Crect fill='%23e5e3e3' x='50' y='40' width='11' height='11'/%3E%3Crect fill='%23e5e3e3' x='40' y='50' width='11' height='11'/%3E%3Crect fill='%23e6e4e4' x='90' y='10' width='11' height='11'/%3E%3Crect fill='%23e6e4e5' x='80' y='20' width='11' height='11'/%3E%3Crect fill='%23e7e5e5' x='70' y='30' width='11' height='11'/%3E%3Crect fill='%23e8e6e6' x='60' y='40' width='11' height='11'/%3E%3Crect fill='%23e8e6e6' x='50' y='50' width='11' height='11'/%3E%3Crect fill='%23e9e7e7' x='90' y='20' width='11' height='11'/%3E%3Crect fill='%23e9e7e7' x='80' y='30' width='11' height='11'/%3E%3Crect fill='%23eae8e8' x='70' y='40' width='11' height='11'/%3E%3Crect fill='%23ebe8e9' x='60' y='50' width='11' height='11'/%3E%3Crect fill='%23ebe9e9' x='90' y='30' width='11' height='11'/%3E%3Crect fill='%23eceaea' x='80' y='40' width='11' height='11'/%3E%3Crect fill='%23eceaea' x='70' y='50' width='11' height='11'/%3E%3Crect fill='%23edebeb' x='90' y='40' width='11' height='11'/%3E%3Crect fill='%23edebeb' x='80' y='50' width='11' height='11'/%3E%3Crect fill='%23EEECEC' x='90' y='50' width='11' height='11'/%3E%3C/g%3E%3C/svg%3E\");\n" +
    "background-attachment: fixed;\n" +
    "background-size: cover;",
  logo: "JRC.png",
  siteTitlePrefix: "JRC RBR",
  divisions: {
    jrcRbrSeason3: {
      divisionName: "jrcRbrSeason3",
      displayName: "RBR Season 3",
      disableSameCarValidation: false,
      // enableSameCarClassValidation: true,
      maxDriversScoringPointsForTeam: 2,
      // filterEntries: true,
      rbr: {
        rallies: [
          {
            eventId: 51550,
            endTime: "2023-01-30 12:59",
            locationName: "Rallye Monte Carlo",
            locationFlag: "MC",
            numStages: 8
          },
          {
            eventId: 52052,
            endTime: "2023-02-06 12:59",
            locationName: "Rally Sweden",
            locationFlag: "SE",
            numStages: 9
          },
          {
            eventId: 52335,
            endTime: "2023-02-13 12:59",
            locationName: "Acropolis Rally",
            locationFlag: "GR",
            numStages: 9
          },
          {
            eventId: 52595,
            endTime: "2023-02-20 12:59",
            locationName: "Rallye Deutschland",
            locationFlag: "DE",
            numStages: 8
          },
          {
            eventId: 52840,
            endTime: "2023-02-27 12:59",
            locationName: "Rally Australia",
            locationFlag: "AU",
            numStages: 9
          }
        ]
      },
      manualResults: [],
      events: [],
      points: {
        powerStage: [5, 4, 3, 2, 1],
        overall: [
          30,
          24,
          21,
          18,
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
      name: "RBR Season 1",
      href: "/rbr/rbr-1"
    },
    {
      name: "RBR Season 2",
      href: "/rbr/rbr-2"
    },
    {
      name: "RBR Off Season 1",
      href: "/rbr/rbr-off-1"
    }
  ]
};
module.exports = initialState;
