const { populateManualEvents } = require("./fetchManual");
const { init, leagueRef } = require("../../state/league");
describe("fetchManual", () => {
  it("populates manual results", async () => {
    await init();
    leagueRef.league.currentDivision = leagueRef.league.divisions["pro"];
    leagueRef.league.currentDivision.drivers = leagueRef.drivers;
    const resultRows = [
      {
        EventId: "1",
        EventCountry: "AU",
        EventEndTime: "2019-09-26T07:00Z",
        Driver: "satchmo",
        Car: "",
        DNF: "yes",
        PSTime: "05:35.345",
        TotalTime: "01:05:59.999"
      },
      {
        EventId: "1",
        EventCountry: "AU",
        EventEndTime: "2019-09-26T07:00Z",
        Driver: "npiipo",
        Car: "",
        DNF: "",
        PSTime: "05:15.345",
        TotalTime: "01:06:59.999"
      },
      {
        EventId: "2",
        EventCountry: "FI",
        EventEndTime: "2019-10-02T07:00Z",
        Driver: "npiipo",
        Car: "",
        DNF: "",
        PSTime: "04:30:123",
        TotalTime: "55:55:123"
      }
    ];
    expect(populateManualEvents(resultRows)).toEqual([
      {
        endTime: "2019-09-26T07:00Z",
        eventId: "1",
        eventStatus: "Finished",
        leaderboardStages: [
          {
            entries: [
              {
                isDnfEntry: true,
                name: "satchmo",
                nationality: null,
                stageTime: "05:35.345",
                totalTime: "01:05:59.999",
                vehicleClass: "Ford Escort Mk II",
                vehicleName: "Ford Escort Mk II"
              },
              {
                isDnfEntry: false,
                name: "npiipo",
                nationality: null,
                stageTime: "05:15.345",
                totalTime: "01:06:59.999",
                vehicleClass: "Ford Escort Mk II",
                vehicleName: "Ford Escort Mk II"
              }
            ]
          }
        ],
        locationFlag: "AU"
      },
      {
        endTime: "2019-10-02T07:00Z",
        eventId: "2",
        eventStatus: "Finished",
        leaderboardStages: [
          {
            entries: [
              {
                isDnfEntry: false,
                name: "npiipo",
                nationality: null,
                stageTime: "04:30:123",
                totalTime: "55:55:123",
                vehicleClass: "Ford Escort Mk II",
                vehicleName: "Ford Escort Mk II"
              }
            ]
          }
        ],
        locationFlag: "FI"
      }
    ]);
  });
});
