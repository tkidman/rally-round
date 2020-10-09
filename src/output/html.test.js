const { colours } = require("./html");
const { getStandingColour } = require("./html");
describe("html", () => {
  describe("getStandingColour", () => {
    const division = {
      promotionDoubleZone: 2,
      promotionZone: 3,
      relegationZone: 3
    };

    it("returns red when standing is in relegation zone", () => {
      const colour = getStandingColour(division, { currentPosition: 18 }, 20);
      expect(colour).toEqual(colours.red);
    });

    it("returns default when standing is not in relegation zone or promotion zone", () => {
      let colour = getStandingColour(division, { currentPosition: 17 }, 20);
      expect(colour).toEqual(colours.default);
      colour = getStandingColour(division, { currentPosition: 6 }, 20);
      expect(colour).toEqual(colours.default);
    });

    it("returns gold when standing is in promotion double zone", () => {
      const colour = getStandingColour(division, { currentPosition: 2 }, 20);
      expect(colour).toEqual(colours.gold);
    });

    it("returns green when standing is in promotion zone", () => {
      let colour = getStandingColour(division, { currentPosition: 3 }, 20);
      expect(colour).toEqual(colours.green);
      colour = getStandingColour(division, { currentPosition: 5 }, 20);
      expect(colour).toEqual(colours.green);
    });

    it("returns green when standing is in promotion zone with no double promotion zone", () => {
      const colour = getStandingColour(
        {
          promotionZone: 3
        },
        { currentPosition: 3 },
        20
      );
      expect(colour).toEqual(colours.green);
    });
  });
});
