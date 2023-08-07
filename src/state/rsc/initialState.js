const rallies = [
  {
    eventId: 58026,
    endTime: "2023-07-17 22:00",
    locationName: "Rally Islas Canarias",
    locationFlag: "ES",
    numStages: 7,
    legs: [
      { startIndex: 0, endIndex: 2 },
      { startIndex: 3, endIndex: 6 }
    ]
    // enduranceRoundMultiplier: 2
  },
  {
    eventId: 58253,
    endTime: "2023-07-24 22:00",
    locationName: "Cyprus Rally",
    locationFlag: "CY",
    numStages: 10,
    legs: [
      { startIndex: 0, endIndex: 5 },
      { startIndex: 6, endIndex: 9 }
    ]
    // enduranceRoundMultiplier: 2
  },
  {
    eventId: 58483,
    endTime: "2023-07-31 22:00",
    locationName: "Rally di Roma Capitale",
    locationFlag: "IT",
    numStages: 8,
    legs: [
      { startIndex: 0, endIndex: 3 },
      { startIndex: 4, endIndex: 7 }
    ]
    // enduranceRoundMultiplier: 2
  },
  {
    eventId: 58727,
    endTime: "2023-08-07 22:00",
    locationName: "Barum Czech Rally Zlin",
    locationFlag: "CZ",
    numStages: 7,
    legs: [
      { startIndex: 0, endIndex: 3 },
      { startIndex: 4, endIndex: 6 }
    ]
    // enduranceRoundMultiplier: 2
  },
  {
    eventId: 58916,
    endTime: "2023-08-14 22:00",
    locationName: "Rally Poland",
    locationFlag: "PL",
    numStages: 0,
    legs: [
      { startIndex: 0, endIndex: 4 },
      { startIndex: 5, endIndex: 7 }
    ]
    // enduranceRoundMultiplier: 2
  }
];

const initialState = {
  pointsForDNF: false,
  websiteName: "rsc-results",
  useStandingsForHome: true,
  showLivePoints: true,
  showLivePointsDaysRemaining: 4,
  // noSuperRallyPointsMultiplier: 2,
  // dropLowestScoringRoundsNumber: 2,
  // afterDropRoundMessage:
  //   "*After Dropped Rounds: total points after 2 lowest scoring rounds removed - endurance rounds count as 2",
  // sortByDropRoundPoints: true,
  showSuperRallyColumn: true,
  hideCarColumnInStandings: false,
  showCarNameAsTextInResults: true,
  nullTeamIsPrivateer: false,
  useCarAsTeam: false,
  // useCarClassAsTeam: true,
  showTeamNameTextColumn: true,
  hideTeamLogoColumn: true,
  disableOverall: true,
  teamPointsForPowerstage: false,
  backgroundStyle:
    "background-image: linear-gradient(315deg, #ffffff 0%, #d7e1ec 74%); background-size: cover; background-repeat: no-repeat; background-attachment: fixed;",
  logo: "rsc-guy.png",
  siteTitlePrefix: "ERC 2018",
  hideStageTimesUntilEventEnd: true,
  teamOverride: {},
  historicalSeasonLinks: [
    { name: "Season 4", href: "/rsc-4" },
    { name: "Season 5", href: "/rsc-5" },
    { name: "WRC 1987", href: "/rsc-1987" },
    { name: "Season 6", href: "/rsc-6" },
    { name: "Old Farts", href: "/rsc-old-farts" }
  ],
  divisions: {
    erc2018: {
      divisionName: "erc2018",
      displayName: "ERC 2018",
      disableSameCarValidation: false,
      // enableSameCarClassValidation: true,
      maxDriversScoringPointsForTeam: 3,
      // filterEntries: { matchDivision: true },
      rbr: {
        rallies
      },
      manualResults: [],
      events: [],
      points: {
        // powerStage: [5, 4, 3, 2, 1],
        leg: [7, 6, 5, 4, 3, 2, 1],
        overall: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1]
      }
      // cars: ["Peugeot 205 GTI"]
    },
    erc2018Junior: {
      divisionName: "erc2018Junior",
      displayName: "ERC 2018 Junior U27",
      disableSameCarValidation: false,
      // enableSameCarClassValidation: true,
      maxDriversScoringPointsForTeam: 4,
      filterEntries: { matchDivision: true },
      rbr: {
        rallies
      },
      manualResults: [],
      events: [],
      points: {
        // powerStage: [5, 4, 3, 2, 1],
        leg: [7, 6, 5, 4, 3, 2, 1],
        overall: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1]
      }
      // cars: ["Peugeot 205 GTI"]
    }
  }
};
module.exports = initialState;
