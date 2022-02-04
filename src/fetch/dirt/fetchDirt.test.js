const {
  getEventKeysFromRecentResults,
  fetchEventsFromKeys
} = require("./fetchDirt");
const { init } = require("../../state/league");

const { fetchEventResults } = require("../../api/dirt");

jest.mock("../../api/dirt");

describe("fetchDirt", () => {
  beforeEach(async () => {
    await init();
  });

  it("gets event keys from recent results and championships", () => {
    const recentResults = require("./__fixtures__/recentResults.json");
    const championships = require("./__fixtures__/championships.json");
    const eventKeys = getEventKeysFromRecentResults({
      recentResults,
      championships,
      division: {},
      divisionName: "pro",
      club: {
        clubId: "123",
        championshipIds: ["65933"]
      }
    });
    expect(eventKeys).toEqual([
      {
        challengeId: "65933",
        divisionName: "pro",
        eventId: "66384",
        eventStatus: "Finished",
        lastStageId: 4,
        location: "ŁĘCZNA COUNTY",
        racenetChampionship: {
          events: [
            {
              countryId: "ePoland",
              countryName: "POLAND",
              entryWindow: {
                close: "2020-05-11T09:00:00Z",
                end: "2020-05-11T09:00:00Z",
                open: "2020-05-04T19:15:00Z",
                start: "2020-05-04T19:15:00Z"
              },
              eventStatus: "Finished",
              eventTime: "",
              firstStageConditions: "eMiddayDry",
              firstStageRouteId: "ePolandRally02Route5",
              hasParticipated: false,
              id: "65933",
              isDlc: true,
              locationId: "ePoland",
              locationName: "ŁĘCZNA COUNTY",
              vehicleClass: "eRallyUpTo20004wdCaps"
            },
            {
              countryId: "aus",
              countryName: "aus",
              entryWindow: {
                close: "2020-05-11T09:00:00Z",
                end: "2020-05-11T09:00:00Z",
                open: "2020-05-04T19:15:00Z",
                start: "2020-05-04T19:15:00Z"
              },
              eventStatus: "Next",
              eventTime: "",
              firstStageConditions: "eMiddayDry",
              firstStageRouteId: "eAusRally02Route5",
              hasParticipated: false,
              id: "65934",
              isDlc: true,
              locationId: "aus",
              locationName: "aus",
              vehicleClass: "eRallyUpTo20004wdCaps"
            }
          ],
          id: "65933",
          name: "Blueline H-Class Championship"
        }
      }
    ]);
  });

  it("gets event keys from recent results and championships including next championships", () => {
    const recentResults = require("./__fixtures__/recentResults.json");
    const championships = require("./__fixtures__/championships.json");
    const eventKeys = getEventKeysFromRecentResults({
      recentResults,
      championships,
      division: {},
      divisionName: "pro",
      club: {
        clubId: "123",
        championshipIds: ["65933"],
        includeNextChampionships: true
      }
    });
    expect(eventKeys).toMatchObject([
      {
        challengeId: "65933",
        divisionName: "pro",
        eventId: "66384",
        eventStatus: "Finished",
        lastStageId: 4,
        location: "ŁĘCZNA COUNTY"
      },
      {
        challengeId: "67014",
        divisionName: "pro",
        eventId: "67465",
        eventStatus: "Active",
        lastStageId: 11,
        location: "ŁĘCZNA COUNTY"
      }
    ]);
  });

  it("fetches events from keys", async () => {
    // aus 1
    fetchEventResults.mockResolvedValueOnce({
      entries: [{ name: "punkly" }, { name: "nonko" }]
    });
    fetchEventResults.mockResolvedValueOnce({
      entries: [{ name: "punkly" }, { name: "nonko" }]
    });
    // swe
    fetchEventResults.mockResolvedValue({
      entries: [{ name: "npiipo" }]
    });
    const events = await fetchEventsFromKeys(
      [
        { location: "Aus", lastStageId: 1 },
        { location: "Swe", lastStageId: 2 }
      ],
      false
    );

    expect(events).toEqual([
      {
        lastStageId: 1,
        location: "Aus",
        racenetLeaderboardStages: [
          {
            entries: [
              {
                name: "punkly"
              },
              {
                name: "nonko"
              }
            ]
          },
          {
            entries: [
              {
                name: "punkly"
              },
              {
                name: "nonko"
              }
            ]
          }
        ]
      },
      {
        lastStageId: 2,
        location: "Swe",
        racenetLeaderboardStages: [
          {
            entries: [
              {
                name: "npiipo"
              }
            ]
          },
          {
            entries: [
              {
                name: "npiipo"
              }
            ]
          }
        ]
      }
    ]);
  });

  it("loads all stages when getAllResults is true", async () => {
    fetchEventResults.mockResolvedValue({
      entries: [{ name: "punkly" }]
    });
    const events = await fetchEventsFromKeys(
      [{ location: "Aus", lastStageId: 2 }],
      true
    );

    expect(events).toEqual([
      {
        lastStageId: 2,
        location: "Aus",
        racenetLeaderboardStages: [
          {
            entries: [
              {
                name: "punkly"
              }
            ]
          },
          {
            entries: [
              {
                name: "punkly"
              }
            ]
          },
          {
            entries: [
              {
                name: "punkly"
              }
            ]
          }
        ]
      }
    ]);
  });
});
