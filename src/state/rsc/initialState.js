const rallies = [
  {
    eventIds: [94754],
    endTime: "2026-03-02 22:00",
    locationName: "Rally Monte Carlo",
    locationFlag: "MC",
    numStages: 8
    // enduranceRoundMultiplier: 2
  }
];

const points = {
  // overall: [20, 15, 12, 10, 8, 6, 4, 3, 2, 1]
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
  hideCarColumnInStandings: false,
  showCarNameAsTextInStandings: false,
  showCarNameAsTextInResults: false,
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
  siteTitlePrefix: "RSC Season 8",
  hideStageTimesUntilEventEnd: true,
  historicalSeasonLinks: [
    { name: "Don't Come Last!", href: "/rsc-dont-come-last" },
    { name: "IRC 2011", href: "/rsc-irc-2011" },
    { name: "Season 7", href: "/rsc-7" },
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
    rscSeason8: {
      divisionName: "rscSeason8",
      displayName: "RSC Season 8",
      disableSameCarValidation: false,
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
    },
    rscSeason8GolfCup: {
      divisionName: "rscSeason8GolfCup",
      displayName: "RSC Season 8 VW Golf Cup",
      disableSameCarValidation: false,
      // enableSameCarClassValidation: true,
      // maxDriversScoringPointsForTeam: 2,
      filterEntries: { allowedCars: ["VW Golf II GTI 16V GrpA"] },
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
