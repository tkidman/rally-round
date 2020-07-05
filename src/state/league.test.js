const { getDriver, league } = require("./league");

const driver = {
  countryName: "Latvia",
  discordName: "Spookex#8354",
  id: "SPOOKEX *-*",
  name: "Spookex *-*",
  raceNetName: "Spookex",
  teamId: "Time Penalty Boys"
};

describe("league", () => {
  test("getDriver", () => {
    expect(getDriver("SPOOKEX *-*")).toEqual(driver);
    expect(getDriver("Spookex")).toEqual(driver);
  });

  test("loads initial state", () => {
    expect(league).toEqual(require("./test/initialState"));
  });
});
