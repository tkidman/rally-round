const rallies = [
  {
    eventId: 60977,
    endTime: "2023-10-16 22:00",
    locationName: "Round 1 Paris",
    locationFlag: "FR",
    numStages: 7,
    // enduranceRoundMultiplier: 2
  },
  {
    eventId: 61348,
    endTime: "2023-10-23 22:00",
    locationName: "Round 2 Sydney",
    locationFlag: "AU",
    numStages: 7,
    // enduranceRoundMultiplier: 2
  },
  {
    eventId: 61680,
    endTime: "2023-10-30 22:00",
    locationName: "Round 3 Switzerland",
    locationFlag: "CH",
    numStages: 7,
    // enduranceRoundMultiplier: 2
  },
  {
    eventId: 61956,
    endTime: "2023-11-06 22:00",
    locationName: "Round 4 Dallas",
    locationFlag: "US",
    numStages: 8,
    // enduranceRoundMultiplier: 2
  },
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
  hideCarColumnInStandings: true,
  showCarNameAsTextInResults: false,
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
  siteTitlePrefix: "RSC World Cup",
  hideStageTimesUntilEventEnd: true,
  historicalSeasonLinks: [
    { name: "Season 4", href: "/rsc-4" },
    { name: "Season 5", href: "/rsc-5" },
    { name: "WRC 1987", href: "/rsc-1987" },
    { name: "Season 6", href: "/rsc-6" },
    { name: "Old Farts", href: "/rsc-old-farts" },
    { name: "ERC 2018", href: "/erc-2018" }
  ],
  divisions: {
    rscWorldCupA: {
      divisionName: "rscWorldCupA",
      displayName: "RSC World Cup A",
      disableSameCarValidation: true,
      // enableSameCarClassValidation: true,
      // maxDriversScoringPointsForTeam: 3,
      filterEntries: { matchDivision: true },
      rbr: {
        rallies
      },
      manualResults: [],
      events: [],
      promotionRelegation: {
        promotionZone: 2
      },
      points: {
        // powerStage: [5, 4, 3, 2, 1],
        // leg: [7, 6, 5, 4, 3, 2, 1],
        overall: [10, 8, 5, 3, 1]
      }
      // cars: ["Peugeot 205 GTI"]
    },
    rscWorldCupB: {
      divisionName: "rscWorldCupB",
      displayName: "RSC World Cup B",
      disableSameCarValidation: true,
      // enableSameCarClassValidation: true,
      // maxDriversScoringPointsForTeam: 3,
      filterEntries: { matchDivision: true },
      rbr: {
        rallies
      },
      manualResults: [],
      events: [],
      promotionRelegation: {
        promotionZone: 2
      },
      points: {
        // powerStage: [5, 4, 3, 2, 1],
        // leg: [7, 6, 5, 4, 3, 2, 1],
        overall: [10, 8, 5, 3, 1]
      }
      // cars: ["Peugeot 205 GTI"]
    },
    rscWorldCupC: {
      divisionName: "rscWorldCupC",
      displayName: "RSC World Cup C",
      disableSameCarValidation: true,
      // enableSameCarClassValidation: true,
      // maxDriversScoringPointsForTeam: 3,
      filterEntries: { matchDivision: true },
      rbr: {
        rallies
      },
      manualResults: [],
      events: [],
      promotionRelegation: {
        promotionZone: 2
      },
      points: {
        // powerStage: [5, 4, 3, 2, 1],
        // leg: [7, 6, 5, 4, 3, 2, 1],
        overall: [10, 8, 5, 3, 1]
      }
      // cars: ["Peugeot 205 GTI"]
    },
    rscWorldCupCD: {
      divisionName: "rscWorldCupD",
      displayName: "RSC World Cup D",
      disableSameCarValidation: true,
      // enableSameCarClassValidation: true,
      // maxDriversScoringPointsForTeam: 3,
      filterEntries: { matchDivision: true },
      rbr: {
        rallies
      },
      manualResults: [],
      events: [],
      promotionRelegation: {
        promotionZone: 2
      },
      points: {
        // powerStage: [5, 4, 3, 2, 1],
        // leg: [7, 6, 5, 4, 3, 2, 1],
        overall: [10, 8, 5, 3, 1]
      }
      // cars: ["Peugeot 205 GTI"]
    }
  }
};
module.exports = initialState;
