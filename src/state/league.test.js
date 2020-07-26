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
});
