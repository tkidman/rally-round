const rallies = [
  {
    eventIds: [72446],
    endTime: "2024-09-03 22:00",
    locationName: "Rally Poland",
    locationFlag: "PL",
    numStages: 8
    // enduranceRoundMultiplier: 2
  },
  {
    eventIds: [72841],
    endTime: "2024-09-10 22:00",
    locationName: "Rally Aus/NZ",
    locationFlag: "NZ",
    numStages: 6
    // enduranceRoundMultiplier: 2
  },
  {
    eventIds: [73080],
    endTime: "2024-09-17 22:00",
    locationName: "Rally Spain",
    locationFlag: "ES",
    numStages: 6
    // enduranceRoundMultiplier: 2
  },
  {
    eventIds: [73355],
    endTime: "2024-09-24 22:00",
    locationName: "Rally Belgium",
    locationFlag: "BE",
    numStages: 8
    // enduranceRoundMultiplier: 2
  },
  {
    eventIds: [73605],
    endTime: "2024-10-01 22:00",
    locationName: "Odd Bunch Rally",
    locationFlag: "RX",
    numStages: 8
    // enduranceRoundMultiplier: 2
  },
  {
    eventIds: [73816],
    endTime: "2024-10-08 22:00",
    locationName: "Rally Finland",
    locationFlag: "FI",
    numStages: 7
    // enduranceRoundMultiplier: 2
  }
];

const points = {
  overall: [20, 15, 12, 10, 8, 6, 4, 3, 2, 1]
};

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
  showCarNameAsTextInStandings: false,
  showCarNameAsTextInResults: true,
  nullTeamIsPrivateer: true,
  useCarAsTeam: false,
  // useCarClassAsTeam: true,
  showTeamNameTextColumn: true,
  hideTeamLogoColumn: true,
  disableOverall: true,
  teamPointsForPowerstage: false,
  backgroundStyle:
    "background-image: linear-gradient(315deg, #ffffff 0%, #d7e1ec 74%); background-size: cover; background-repeat: no-repeat; background-attachment: fixed;",
  logo: "rsc-guy.png",
  siteTitlePrefix: "RSC Season 7",
  hideStageTimesUntilEventEnd: true,
  historicalSeasonLinks: [
    { name: "Audi vs Porsche", href: "/rsc-audi-vs-porsche" },
    { name: "Fiat Christmas", href: "/rsc-fiat-christmas" },
    { name: "World Cup Finals", href: "/rsc-world-cup-finals" },
    { name: "World Cup Groups", href: "/rsc-world-cup-group-stage" },
    { name: "ERC 2018", href: "/erc-2018" },
    { name: "Old Farts", href: "/rsc-old-farts" },
    { name: "Season 6", href: "/rsc-6" },
    { name: "WRC 1987", href: "/rsc-1987" },
    { name: "Season 5", href: "/rsc-5" },
    { name: "Season 4", href: "/rsc-4" }
  ],
  divisions: {
    rscSeason7: {
      divisionName: "rscSeason7",
      displayName: "RSC Season 7",
      disableSameCarValidation: true,
      // enableSameCarClassValidation: true,
      maxDriversScoringPointsForTeam: 2,
      // filterEntries: { allowedCars: [] },
      rbr: {
        rallies
      },
      manualResults: [],
      events: [],
      points
      // cars: ["Peugeot 205 GTI"]
    }
  }
};
module.exports = initialState;
