const initialState = {
  showLivePoints: true,
  divisions: {
    pro: {
      maxDriversScoringPointsForTeam: 1,
      events: [
        {
          eventId: "221955",
          challengeId: "221496",
          location: "Australia"
        }
      ],
      points: {
        powerStage: [5, 4, 3, 2, 1],
        overall: [10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
        stage: [1]
      },
      cars: ["Alpine Renault A110 1600 S", "Ford Escort Mk II"],
      manualResults: [
        {
          eventIndex: 0,
          results: [
            {
              name: "SFRrallimoilane",
              stageTime: "05:33.000",
              totalTime: "04:59:59.000"
            }
          ]
        }
      ],
      promotionRelegation: {
        promotionZone: 1
      }
    }
  },
  teamOverride: {
    Kuul: ["Ditch Dusters"]
  }
};

module.exports = initialState;
