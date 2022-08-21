const initialState = {
  pointsForDNF: false,
  websiteName: "jrc-results",
  // subfolderName: "worldcup",
  logo: "JRC.png",
  siteTitlePrefix: "JRC",
  useStandingsForHome: true,
  showLivePoints: true,
  showLivePointsDaysRemaining: 4,
  showCarNameAsTextInResults: true,
  hideCarColumnInStandings: false,
  useCarAsTeam: false,
  useNationalityAsTeam: true,
  disableOverall: true,
  teamPointsForPowerstage: false,
  // dropLowestScoringRoundsNumber: 1,
  incorrectCarTimePenaltySeconds: 120,
  backgroundStyle:
    "background-image: linear-gradient(#2193b0, #6dd5ed); background-size: cover; background-repeat: no-repeat; background-attachment: fixed;",
  divisions: {
    worldCup: {
      divisionName: "worldCup",
      displayName: "JRC World Cup",
      disableSameCarValidation: true,
      maxDriversScoringPointsForTeam: 2,
      clubs: [
        {
          clubId: "397779",
          championshipIds: ["655017"],
          includeNextChampionships: true
        }
      ],
      events: [],
      manualResults: [],
      cars: [
        "Seat Ibiza Kit Car",
        "Volkswagen Golf Kitcar",
        "SUBARU Legacy RS",
        "SUBARU Impreza 1995",
        "Mitsubishi Lancer Evolution VI",
        "Ford Escort RS Cosworth",
        "Renault 5 Turbo",
        "BMW E30 M3 Evo Rally",
        "Opel Ascona 400",
        "Lancia Stratos",
        "Datsun 240Z",
        "Ford Sierra Cosworth RS500"
      ],
      points: {
        powerStage: [],
        overall: []
      }
    }
  }
};

module.exports = initialState;
