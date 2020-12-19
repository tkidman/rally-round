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
        overall: [10, 9, 8, 7, 6, 5, 4, 3, 2, 1]
      },
      manualResults: [
        {
          eventId: "221955",
          results: [
            {
              name: "SFRrallimoilane",
              stageTime: "05:33.000",
              stageDiff: "--",
              totalTime: "04:59:59.000",
              totalDiff: "+18:23.013"
            }
          ]
        }
      ]
    }
  },
  teamOverride: {
    Kuul: ["Ditch Dusters"]
  }
};

module.exports = initialState;
