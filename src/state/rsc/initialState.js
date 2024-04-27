const rallies = [
  {
    eventIds: [68133, 68134],
    endTime: "2024-04-22 22:00",
    locationName: "Round 1",
    locationFlag: "RX",
    numStages: 7
    // enduranceRoundMultiplier: 2
  },
  {
    eventIds: [68510, 68511],
    endTime: "2024-04-30 22:00",
    locationName: "Round 2",
    locationFlag: "RX",
    numStages: 7
    // enduranceRoundMultiplier: 2
  }
];

const points = {
  overall: [
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
    1
  ]
};

const initialState = {
  pointsForDNF: false,
  websiteName: "rsc-results",
  useStandingsForHome: true,
  showLivePoints: false,
  showLivePointsDaysRemaining: 4,
  // noSuperRallyPointsMultiplier: 2,
  // dropLowestScoringRoundsNumber: 2,
  // afterDropRoundMessage:
  //   "*After Dropped Rounds: total points after 2 lowest scoring rounds removed - endurance rounds count as 2",
  // sortByDropRoundPoints: true,
  showSuperRallyColumn: true,
  hideCarColumnInStandings: false,
  showCarNameAsTextInStandings: false,
  showCarNameAsTextInResults: false,
  nullTeamIsPrivateer: false,
  useCarAsTeam: true,
  // useCarClassAsTeam: true,
  showTeamNameTextColumn: false,
  hideTeamLogoColumn: false,
  disableOverall: true,
  teamPointsForPowerstage: false,
  backgroundStyle:
    "background-image: linear-gradient(315deg, #ffffff 0%, #d7e1ec 74%); background-size: cover; background-repeat: no-repeat; background-attachment: fixed;",
  logo: "rsc-guy.png",
  siteTitlePrefix: "Audi vs Porsche",
  hideStageTimesUntilEventEnd: true,
  historicalSeasonLinks: [
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
    audiVsPorsche: {
      divisionName: "open",
      displayName: "Audi vs Porsche",
      disableSameCarValidation: false,
      // enableSameCarClassValidation: true,
      maxDriversScoringPointsForTeam: 4,
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
