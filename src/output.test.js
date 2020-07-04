const { buildDriverRows } = require("./output");

describe("output", () => {
  test("builds driver rows", () => {
    expect(
      buildDriverRows({
        results: {
          driverResults: [
            {
              name: "satchmo"
            }
          ]
        }
      })
    ).toMatchObject([
      {
        DRIVER: "satchmo"
      }
    ]);
  });
});
