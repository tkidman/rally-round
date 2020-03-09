const { driversById } = require("./index");
describe("referenceData", () => {
  test("loadDriversFromCSV", () => {
    expect(driversById["SATCHMO"]).toEqual({
      country: "au",
      countryImg:
        '<img src="https://bluelineleague.com/wp-content/uploads/2020/01/au.png" alt="" width="32" height="32" class="alignnone size-full wp-image-1476" />',
      id: "SATCHMO",
      name: "SATCHMO",
      teamId: "Live and let DNF",
      teamImg:
        '<img src="https://bluelineleague.com/wp-content/uploads/2020/01/Live_and_let_DNF-300x225.png" alt="" width="32" height="32" title="Live and let DNF" />'
    });
  });
});
