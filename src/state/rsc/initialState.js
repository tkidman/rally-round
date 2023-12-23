const rallies = [
  {
    eventId: 63664,
    endTime: "2023-12-25 22:00",
    locationName: "",
    locationFlag: "AQ",
    numStages: 9
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
  showLivePoints: true,
  showLivePointsDaysRemaining: 4,
  // noSuperRallyPointsMultiplier: 2,
  // dropLowestScoringRoundsNumber: 2,
  // afterDropRoundMessage:
  //   "*After Dropped Rounds: total points after 2 lowest scoring rounds removed - endurance rounds count as 2",
  // sortByDropRoundPoints: true,
  showSuperRallyColumn: true,
  hideCarColumnInStandings: false,
  showCarNameAsTextInStandings: true,
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
  siteTitlePrefix: "RSC Fiat Christmas Rally",
  hideStageTimesUntilEventEnd: true,
  historicalSeasonLinks: [
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
    open: {
      divisionName: "open",
      displayName: "Open Fiat Christmas Rally",
      disableSameCarValidation: true,
      // enableSameCarClassValidation: true,
      // maxDriversScoringPointsForTeam: 3,
      // filterEntries: { allowedCars: [] },
      rbr: {
        rallies
      },
      manualResults: [],
      events: [],
      points
      // cars: ["Peugeot 205 GTI"]
    },
    punto: {
      divisionName: "punto",
      displayName: "Abarth Grande Punto S2000",
      disableSameCarValidation: true,
      // enableSameCarClassValidation: true,
      // maxDriversScoringPointsForTeam: 3,
      filterEntries: { allowedCars: ["Abarth Grande Punto S2000"] },
      rbr: {
        rallies
      },
      manualResults: [],
      events: [],
      points
      // cars: ["Peugeot 205 GTI"]
    },
    RGT: {
      divisionName: "RGT",
      displayName: "Fiat 124 Abarth Rally RGT",
      disableSameCarValidation: true,
      // enableSameCarClassValidation: true,
      // maxDriversScoringPointsForTeam: 3,
      filterEntries: { allowedCars: ["Fiat 124 Abarth Rally RGT"] },
      rbr: {
        rallies
      },
      manualResults: [],
      events: [],
      points
      // cars: ["Peugeot 205 GTI"]
    },
    R3T: {
      divisionName: "R3T",
      displayName: "Fiat Abarth 500 R3T",
      disableSameCarValidation: true,
      // enableSameCarClassValidation: true,
      // maxDriversScoringPointsForTeam: 3,
      filterEntries: { allowedCars: ["Fiat Abarth 500 R3T"] },
      rbr: {
        rallies
      },
      manualResults: [],
      events: [],
      points
      // cars: ["Peugeot 205 GTI"]
    },
    Grp4: {
      divisionName: "Grp4",
      displayName: "Fiat 131 Abarth Grp4",
      disableSameCarValidation: true,
      // enableSameCarClassValidation: true,
      // maxDriversScoringPointsForTeam: 3,
      filterEntries: { allowedCars: ["Fiat 131 Abarth Grp4"] },
      rbr: {
        rallies
      },
      manualResults: [],
      events: [],
      points
      // cars: ["Peugeot 205 GTI"]
    },
    Grp2: {
      divisionName: "Grp2",
      displayName: "Fiat 126 Grp2",
      disableSameCarValidation: true,
      // enableSameCarClassValidation: true,
      // maxDriversScoringPointsForTeam: 3,
      filterEntries: { allowedCars: ["Fiat 126 Grp2"] },
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
