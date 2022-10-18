const { privateer } = require("../../shared");
const initialState = {
  pointsForDNF: false,
  websiteName: "jrc-results",
  subfolderName: "rbr",
  showLivePoints: true,
  showLivePointsDaysRemaining: 7,
  hideCarColumnInStandings: true,
  showCarNameAsTextInResults: true,
  nullTeamIsPrivateer: true,
  dropLowestScoringRoundsNumber: 1,
  sortByDropRoundPoints: true,
  // useCarAsTeam: false,
  // useCarClassAsTeam: true,
  disableOverall: true,
  teamPointsForPowerstage: true,
  backgroundStyle:
    "background-image: linear-gradient(315deg, #eec0c6 0%, #7ee8fa 74%); background-size: cover; background-repeat: no-repeat; background-attachment: fixed;",
  logo: "JRC.png",
  siteTitlePrefix: "JRC RBR",
  divisions: {
    jrcRbr: {
      divisionName: "rbrSeason2",
      displayName: "RBR Season 2",
      disableSameCarValidation: false,
      // enableSameCarClassValidation: true,
      maxDriversScoringPointsForTeam: 2,
      // filterEntries: true,
      rbr: {
        rallies: [
          {
            eventId: 44820,
            endTime: "2022-07-03 23:59",
            locationName: "Rallye Monte-Cresto",
            locationFlag: "MC",
            numStages: 8
          },
          {
            eventId: 45147,
            endTime: "2022-07-18 12:59",
            locationName: "Arctic Nordic Rally",
            locationFlag: "FI",
            numStages: 8
          },
          {
            eventId: 45482,
            endTime: "2022-08-01 12:59",
            locationName: "Nordic Summer Rally",
            locationFlag: "SE",
            numStages: 8
          },
          {
            eventId: 45837,
            endTime: "2022-08-15 12:59",
            locationName: "Wales Rally GB",
            locationFlag: "welsh",
            numStages: 10
          },
          {
            eventId: 46202,
            endTime: "2022-08-29 13:59",
            locationName: "Rallye de France",
            locationFlag: "FR",
            numStages: 9
          },
          {
            eventId: 46602,
            endTime: "2022-09-12 10:59",
            locationName: "Rally USA",
            locationFlag: "US",
            numStages: 12
          }
        ]
      },
      manualResults: [],
      events: [],
      points: {
        powerStage: [5, 4, 3, 2, 1],
        overall: [24, 19, 16, 14, 12, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1]
        // stage: [1]
      }
      // cars: ["Peugeot 205 GTI"]
      // outputSheetId: "1C3fU9y1236wFmPuKcui4CEXBuSsUANH6OJ0BpQIasTc"
    }
  },
  teamOverride: {
    skullengaged: [privateer],
    Wiberg: [privateer],
    Ducce950: [privateer, privateer],
    "Maximilian Maksy": [privateer, privateer, privateer],
    dimitrisqwerty: [privateer, privateer, privateer]
  }
};
module.exports = initialState;
