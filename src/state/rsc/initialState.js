const rallies = [
  {
    eventId: 62270,
    endTime: "2023-11-14 21:00",
    locationName: "London",
    locationFlag: "GB",
    numStages: 7
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
    { name: "World Cup Groups", href: "/rsc-world-cup-group-stage" },
    { name: "ERC 2018", href: "/erc-2018" },
    { name: "Old Farts", href: "/rsc-old-farts" },
    { name: "Season 6", href: "/rsc-6" },
    { name: "WRC 1987", href: "/rsc-1987" },
    { name: "Season 5", href: "/rsc-5" },
    { name: "Season 4", href: "/rsc-4" }
  ],
  divisions: {
    rscWorldCupFinal: {
      divisionName: "rscWorldCupFinal",
      displayName: "RSC World Cup Final",
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
    rscWorldCupOpen: {
      divisionName: "rscWorldCupOpen",
      displayName: "RSC Open",
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
