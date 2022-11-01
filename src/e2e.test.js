const fs = require("fs");
const copydir = require("copy-dir");

describe("e2e", () => {
  beforeAll(async () => {
    process.env.CLUB = "test-e2e";
    const { processAllDivisions } = require("./index");
    const { checkOutputDirs } = require("./output/output");
    const { cachePath } = require("./shared");
    checkOutputDirs();
    copydir.sync("./src/__fixtures__/e2e", `${cachePath}`);
    await processAllDivisions();
  });

  it("generates driver standings", async () => {
    const { outputPath } = require("./shared");
    const standings = fs.readFileSync(
      `${outputPath}/website/index.html`,
      "utf-8"
    );
    expect(standings).toMatchSnapshot();
  });

  it("generates driver results", async () => {
    const { outputPath } = require("./shared");
    const standings = fs.readFileSync(
      `${outputPath}/website/test-e2e-0-driver-results.html`,
      "utf-8"
    );
    expect(standings).toMatchSnapshot();
  });

  it("generates team standings", async () => {
    const { outputPath } = require("./shared");
    const standings = fs.readFileSync(
      `${outputPath}/website/test-e2e-team-standings.html`,
      "utf-8"
    );
    expect(standings).toMatchSnapshot();
  });

  it("generates overall driver standings", async () => {
    const { outputPath } = require("./shared");
    const standings = fs.readFileSync(
      `${outputPath}/website/overall-driver-standings.html`,
      "utf-8"
    );
    expect(standings).toMatchSnapshot();
  });

  it("generates overall team standings", async () => {
    const { outputPath } = require("./shared");
    const standings = fs.readFileSync(
      `${outputPath}/website/overall-team-standings.html`,
      "utf-8"
    );
    expect(standings).toMatchSnapshot();
  });

  it("generates overall driver results", async () => {
    const { outputPath } = require("./shared");
    const standings = fs.readFileSync(
      `${outputPath}/website/overall-1-driver-results.html`,
      "utf-8"
    );
    expect(standings).toMatchSnapshot();
  });

  afterAll(() => delete process.env.CLUB);
});
