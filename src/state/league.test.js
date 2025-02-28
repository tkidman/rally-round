const moment = require("moment");
const { leagueRef, init, getTeamIds, getCarByName } = require("./league");

const driver = {
  car: "Alpine Renault A110 1600 S",
  division: "pro",
  id: "SPOOKEX *-*",
  name: "Spookex *-*",
  name3: null,
  nationality: null,
  raceNetName: "Spookex",
  team2Id: null,
  teamId: "Time Penalty Boys"
};

describe("league", () => {
  beforeEach(async () => {
    await init();
    leagueRef.league.currentDivision = leagueRef.league.divisions["pro"];
    leagueRef.league.currentDivision.drivers = leagueRef.drivers;
  });

  test("getDriver", () => {
    expect(leagueRef.getDriver("SPOOKEX *-*")).toEqual(driver);
    expect(leagueRef.getDriver("Spookex")).toEqual(driver);
  });

  test("loads initial state", () => {
    expect(leagueRef.league).toEqual(require("./test/initialState"));
  });

  describe("showLivePoints", () => {
    test("returns true when days remaining is less than showLivePointsDaysRemaining", () => {
      leagueRef.league.showLivePoints = true;
      leagueRef.league.showLivePointsDaysRemaining = 3;
      leagueRef.endTime = moment()
        .utc()
        .add(3, "days")
        .toISOString();
      expect(leagueRef.showLivePoints()).toBeTruthy();

      leagueRef.league.showLivePointsDaysRemaining = 4;
      expect(leagueRef.showLivePoints()).toBeTruthy();
    });

    test("returns false when days remaining is greater than showLivePointsDaysRemaining", () => {
      leagueRef.league.showLivePoints = true;
      leagueRef.league.showLivePointsDaysRemaining = 2;
      leagueRef.endTime = moment()
        .utc()
        .add(3, "days")
        .toISOString();
      expect(leagueRef.showLivePoints()).toBeFalsy();
    });

    test("returns false when show live points is false", () => {
      leagueRef.league.showLivePoints = false;
      leagueRef.league.showLivePointsDaysRemaining = null;
      expect(leagueRef.showLivePoints()).toBeFalsy();
    });

    test("returns true when show live points is true and no showLivePointDaysRemaining set", () => {
      leagueRef.league.showLivePoints = true;
      leagueRef.league.showLivePointsDaysRemaining = null;
      expect(leagueRef.showLivePoints()).toBeTruthy();
    });
  });

  test("getTeamIds", () => {
    const teamIds = getTeamIds();
    expect(teamIds).toEqual([
      "Time Penalty Boys",
      "Unlimited Pedal Works",
      "Ditch Dusters",
      "Flat Out Racing",
      "Full Send"
    ]);
  });

  test("getCarByName", () => {
    expect(getCarByName("Mustang Ford XL12")).toEqual({
      brand: "ford",
      class: "unknown"
    });

    expect(getCarByName("SUBARU impreza")).toEqual({
      brand: "subaru",
      class: "2000cc"
    });
  });
});
