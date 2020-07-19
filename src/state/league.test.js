const { getDriver, league } = require("./league");

const driver = {
  car: "Alpine Renault A110 1600 S",
  countryName: "Latvia",
  discordName: "Spookex#8354",
  division: "Amateur",
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
