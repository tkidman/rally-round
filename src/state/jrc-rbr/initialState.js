const initialState = {
  pointsForDNF: false,
  websiteName: "jrc-results",
  subfolderName: "rbr",
  showLivePoints: true,
  showLivePointsDaysRemaining: 7,
  hideCarColumnInStandings: true,
  showCarNameAsTextInResults: true,
  nullTeamIsPrivateer: true,
  // useCarAsTeam: false,
  // useCarClassAsTeam: true,
  disableOverall: true,
  teamPointsForPowerstage: true,
  backgroundStyle:
    "background-image: linear-gradient(315deg, #eec0c6 0%, #7ee8fa 74%); background-size: cover; background-repeat: no-repeat; background-attachment: fixed;",
  logo: "JRC.png",
  siteTitlePrefix: "JRC",
  divisions: {
    jrcRbr: {
      divisionName: "rbrSeason1",
      displayName: "RBR Season 1",
      disableSameCarValidation: false,
      // enableSameCarClassValidation: true,
      maxDriversScoringPointsForTeam: 2,
      // filterEntries: true,
      rbr: {
        rallies: [
          {
            eventId: 40706,
            endTime: "2022-01-31 00:59",
            locationName: "Monte Carlo",
            locationFlag: "MC",
            numStages: 8
          },
          {
            eventId: 41156,
            endTime: "2022-02-14 12:59",
            locationName: "Arctic Nordic",
            locationFlag: "SE",
            numStages: 10
          },
          {
            eventId: 41536,
            endTime: "2022-02-28 12:59",
            locationName: "Safari Rally Africa",
            locationFlag: "KE",
            numStages: 8
          },
          {
            eventId: 42024,
            endTime: "2022-03-14 12:59",
            locationName: "Rally Czechia",
            locationFlag: "CZ",
            numStages: 10
          },
          {
            eventId: 42449,
            endTime: "2022-03-28 12:59",
            locationName: "SSS Rally",
            locationFlag: "RX",
            numStages: 13
          },
          {
            eventId: 42799,
            endTime: "2022-04-11 12:59",
            locationName: "Rally New Zealand",
            locationFlag: "NZ",
            numStages: 11
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
  }
};
module.exports = initialState;
