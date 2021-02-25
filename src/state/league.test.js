const moment = require("moment");
const { leagueRef, init } = require("./league");

const driver = {
  car: "Alpine Renault A110 1600 S",
  division: "Amateur",
  id: "SPOOKEX *-*",
  name: "Spookex *-*",
  raceNetName: "Spookex",
  teamId: "Time Penalty Boys"
};

describe("league", () => {
  beforeEach(async () => {
    await init();
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
});
