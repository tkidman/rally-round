const fs = require("fs");
const copydir = require("copy-dir");

describe("e2e", () => {
  it("generates the site", async () => {
    process.env.CLUB = "test-e2e";
    const { processAllDivisions } = require("./index");
    const { checkOutputDirs } = require("./output/output");
    const { cachePath, outputPath } = require("./shared");
    checkOutputDirs();
    copydir.sync("./src/__fixtures__/e2e", `${cachePath}`);
    await processAllDivisions();
    const standings = fs.readFileSync(
      `${outputPath}/website/index.html`,
      "utf-8"
    );
    expect(standings).toMatchSnapshot();
  });

  afterEach(() => delete process.env.CLUB);
});
