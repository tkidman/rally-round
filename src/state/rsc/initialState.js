const rallies = [
  {
    eventIds: [77899],
    endTime: "2025-01-21 21:00",
    locationName: "Rally Islas Canarias",
    locationFlag: "ES",
    numStages: 6
    // enduranceRoundMultiplier: 2
  },
  {
    eventIds: [78204],
    endTime: "2025-01-28 22:00",
    locationName: "Ypres Rally",
    locationFlag: "BE",
    numStages: 9
    // enduranceRoundMultiplier: 2
  },
  {
    eventIds: [78568],
    endTime: "2025-02-04 22:00",
    locationName: "Barum Czech Rally Zlín",
    locationFlag: "CZ",
    numStages: 7
    // enduranceRoundMultiplier: 2
  }
];

const points = {
  overall: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1]
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
  siteTitlePrefix: "RSC IRC 2011",
  hideStageTimesUntilEventEnd: true,
  historicalSeasonLinks: [
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
    rscIrc2011: {
      divisionName: "rscIrc2011",
      displayName: "RSC IRC 2011",
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
    rscIrc20112WD: {
      divisionName: "rscIrc20112WD",
      displayName: "RSC IRC 2011 2WD",
      disableSameCarValidation: false,
      // enableSameCarClassValidation: true,
      maxDriversScoringPointsForTeam: 2,
      filterEntries: {
        allowedCars: [
          "Citroen DS3 R3-MAX",
          "Honda Civic Type R(FN2) R3",
          "Renault Clio III R3",
          "Fiat Abarth 500 R3T"
        ]
      },
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
