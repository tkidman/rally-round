const { buildDriverRows } = require("./output");
const { init } = require("../state/league");

describe("output", () => {
  beforeEach(async () => {
    await init();
  });

  test("builds driver rows", () => {
    expect(
      buildDriverRows({
        results: {
          driverResults: [
            {
              name: "satchmo",
              entry: {
                totalTime: "04:41:35.987"
              }
            }
          ]
        }
      })
    ).toMatchObject([
      {
        DRIVER: "satchmo",
        TOTAL: "04:41:35.987"
      }
    ]);
  });
});
