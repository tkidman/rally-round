const { processCsv } = require("./fetchRBR");
const fs = require("fs");

describe("fetchRbr", () => {
  describe("fetchEvent", () => {
    it("fetches an event", async () => {
      const eventResultsCsv = fs.readFileSync(
        `src/fetch/rbr/__fixtures__/40706_table.csv`,
        "utf8"
      );

      const results = processCsv(eventResultsCsv, {
        eventId: 40706,
        numStages: 2
      });
      expect(results).toEqual({
        eventId: 40706,
        numStages: 2,
        racenetLeaderboardStages: [
          {
            entries: [
              {
                isDnfEntry: false,
                name: "Puki2579",
                nationality: "NZ",
                stageDiff: "--",
                stageTime: "00:06:07.491",
                totalDiff: "--",
                totalTime: "00:06:07.491",
                vehicleClass: "Super 2000",
                vehicleName: "Abarth Grande Punto S2000"
              },
              {
                isDnfEntry: false,
                name: "satchmo",
                nationality: "AU",
                stageDiff: "+00:00:09.275",
                stageTime: "00:06:16.766",
                totalDiff: "+00:00:09.275",
                totalTime: "00:06:16.766",
                vehicleClass: "Super 2000",
                vehicleName: "Peugeot 207 S2000 Evolution Plus"
              }
            ]
          },
          {
            entries: [
              {
                isDnfEntry: false,
                name: "Puki2579",
                nationality: "NZ",
                stageDiff: "--",
                stageTime: "00:10:46.324",
                totalDiff: "--",
                totalTime: "00:16:53.815",
                vehicleClass: "Super 2000",
                vehicleName: "Abarth Grande Punto S2000"
              }
            ]
          }
        ]
      });
    });
  });
});
