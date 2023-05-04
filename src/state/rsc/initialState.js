const rallies = [
  {
    eventId: 55802,
    endTime: "2023-05-08 22:00",
    locationName: "Rally Eggleston",
    locationFlag: "EU",
    numStages: 9
    // enduranceRoundMultiplier: 2
  }
];

const initialState = {
  pointsForDNF: false,
  websiteName: "rsc-results",
  useStandingsForHome: true,
  // subfolderName: "rbr",
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
  nullTeamIsPrivateer: true,
  useCarAsTeam: true,
  // useCarClassAsTeam: true,
  showTeamNameTextColumn: false,
  hideTeamLogoColumn: true,
  disableOverall: true,
  teamPointsForPowerstage: false,
  backgroundStyle:
    "background-image: linear-gradient(315deg, #ffffff 0%, #d7e1ec 74%); background-size: cover; background-repeat: no-repeat; background-attachment: fixed;",
  logo: "rsc-guy.png",
  siteTitlePrefix: "RSC Season 6",
  hideStageTimesUntilEventEnd: true,
  teamOverride: {},
  historicalSeasonLinks: [
    { name: "Season 4", href: "/rsc-4" },
    { name: "Season 5", href: "/rsc-5" },
    { name: "WRC 1987", href: "/rsc-1987" },
    { name: "Season 6", href: "/rsc-6" }
  ],
  divisions: {
    rscOldFarts: {
      divisionName: "rscOldFarts",
      displayName: "RSC OLDFARTS",
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
        powerStage: [5, 4, 3, 2, 1],
        overall: [
          40,
          35,
          31,
          27,
          23,
          20,
          17,
          15,
          13,
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
      }
      // cars: ["Peugeot 205 GTI"]
    },
    rscOldFartsLadaCup: {
      divisionName: "rscOldFartsLadaCup",
      displayName: "RSC OLDFARTS Lada Cup",
      disableSameCarValidation: false,
      // enableSameCarClassValidation: true,
      maxDriversScoringPointsForTeam: 3,
      filterEntries: {
        allowedCars: ["Lada VFTS GrpB"]
      },
      rbr: {
        rallies
      },
      manualResults: [],
      events: [],
      points: {
        // powerStage: [5, 4, 3, 2, 1],
        overall: [10, 7, 5, 3, 2, 1]
      }
      // cars: ["Peugeot 205 GTI"]
    },
    rscOldFartsSkodaCup: {
      divisionName: "rscOldFartsSkodaCup",
      displayName: "RSC OLDFARTS Skoda Cup",
      disableSameCarValidation: false,
      // enableSameCarClassValidation: true,
      maxDriversScoringPointsForTeam: 3,
      filterEntries: {
        allowedCars: ["Skoda 130 RS Grp2"]
      },
      rbr: {
        rallies
      },
      manualResults: [],
      events: [],
      points: {
        // powerStage: [5, 4, 3, 2, 1],
        overall: [10, 7, 5, 3, 2, 1]
      }
      // cars: ["Peugeot 205 GTI"]
    }
  }
};
module.exports = initialState;
