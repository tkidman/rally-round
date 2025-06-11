const rallies = [
  {
    eventIds: [84045],
    endTime: "2025-06-17 22:00",
    locationName: "Round 1",
    locationFlag: "RC",
    numStages: 8
    // enduranceRoundMultiplier: 2
  }
];

const overall = [];
for (let i = 50; i >= 1; i--) {
  overall.push(i);
}
const points = {
  overall
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
  hideCarColumnInStandings: true,
  showCarNameAsTextInStandings: false,
  showCarNameAsTextInResults: true,
  nullTeamIsPrivateer: true,
  useCarAsTeam: false,
  // useCarClassAsTeam: true,
  showTeamNameTextColumn: false,
  hideTeamLogoColumn: true,
  disableOverall: true,
  teamPointsForPowerstage: false,
  backgroundStyle:
    "background-image: linear-gradient(315deg, #ffffff 0%, #d7e1ec 74%); background-size: cover; background-repeat: no-repeat; background-attachment: fixed;",
  logo: "rsc-guy.png",
  siteTitlePrefix: "RSC Don't Come Last",
  hideStageTimesUntilEventEnd: true,
  usePercentageForPromotionRelegationZones: true,
  historicalSeasonLinks: [
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
    dontComeLast: {
      divisionName: "dontComeLast",
      displayName: "RSC Don't Come Last",
      disableSameCarValidation: false,
      // enableSameCarClassValidation: true,
      // maxDriversScoringPointsForTeam: 2,
      // filterEntries: { allowedCars: [] },
      rbr: {
        rallies
      },
      manualResults: [],
      events: [],
      points,
      promotionRelegation: {
        relegationZone: 25
      }
      // cars: ["Peugeot 205 GTI"]
    }
  }
};

module.exports = initialState;
