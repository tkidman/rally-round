const { getDriver } = require("./index");

const driver = {
  countryName: "Latvia",
  discordName: "Spookex#8354",
  id: "SPOOKEX *-*",
  name: "Spookex *-*",
  raceNetName: "Spookex",
  teamId: "Time Penalty Boys"
};

describe("referenceData", () => {
  test("getDriver", () => {
    expect(getDriver("SPOOKEX *-*")).toEqual(driver);
    expect(getDriver("Spookex")).toEqual(driver);
  });
});
