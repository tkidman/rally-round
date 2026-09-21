const {
  useDropRoundPoints,
  getLastCompletedEvents,
  getDivisionPanels,
  compactStageTime,
  compactTimeDiff
} = require("./html");
const { leagueRef } = require("../state/league");

describe("useDropRoundPoints", () => {
  const event = (fields = {}) => ({
    standings: { driverStandings: [] },
    ...fields
  });
  const events = count => Array.from({ length: count }, () => event());

  beforeEach(() => {
    leagueRef.league = {
      dropLowestScoringRoundsNumber: 1,
      sortByDropRoundPoints: true
    };
    leagueRef.endTime = null;
    leagueRef.showLivePoints = () => false;
  });

  test("uses total points while rounds driven do not exceed drop rounds", () => {
    expect(useDropRoundPoints({ events: [] })).toBe(false);
    expect(useDropRoundPoints({ events: events(1) })).toBe(false);
  });

  test("uses drop round points once more rounds than drop rounds are driven", () => {
    expect(useDropRoundPoints({ events: events(2) })).toBe(true);
  });

  test("ignores the active event when live points are not shown", () => {
    leagueRef.endTime = "2026-09-20T18:00:00Z";
    expect(useDropRoundPoints({ events: events(2) })).toBe(false);
    leagueRef.showLivePoints = () => true;
    expect(useDropRoundPoints({ events: events(2) })).toBe(true);
  });

  test("ignores events without standings", () => {
    expect(useDropRoundPoints({ events: [event(), {}] })).toBe(false);
  });

  test("weights rounds by endurance multiplier", () => {
    leagueRef.league.dropLowestScoringRoundsNumber = 2;
    expect(useDropRoundPoints({ events: events(2) })).toBe(false);
    expect(
      useDropRoundPoints({
        events: [event({ enduranceRoundMultiplier: 2 }), event()]
      })
    ).toBe(true);
  });

  test("uses total points when standings are not sorted by drop round points", () => {
    leagueRef.league.sortByDropRoundPoints = false;
    expect(useDropRoundPoints({ events: events(3) })).toBe(false);
  });

  test("uses total points when there are no drop rounds", () => {
    leagueRef.league.dropLowestScoringRoundsNumber = 0;
    expect(useDropRoundPoints({ events: events(3) })).toBe(false);
  });
});

describe("compact timing displays", () => {
  test("removes only a zero hour from stage times", () => {
    expect(compactStageTime("00:06:15.778")).toBe("06:15.778");
    expect(compactStageTime("00:00:39.094")).toBe("00:39.094");
    expect(compactStageTime("01:06:15.778")).toBe("1:06:15.778");
    expect(compactStageTime("15:00:00.000")).toBe("15:00:00.000");
  });

  test("removes redundant leading units from gaps", () => {
    expect(compactTimeDiff("+00:00:01.952")).toBe("+1.952");
    expect(compactTimeDiff("+00:02:06.986")).toBe("+2:06.986");
    expect(compactTimeDiff("+01:02:06.986")).toBe("+1:02:06.986");
    expect(compactTimeDiff("-00:00:00.358")).toBe("-0.358");
  });

  test("leaves result markers unchanged", () => {
    expect(compactTimeDiff("--")).toBe("--");
    expect(compactTimeDiff("N/A")).toBe("N/A");
    expect(compactTimeDiff(undefined)).toBeUndefined();
  });
});

describe("getLastCompletedEvents", () => {
  const finished = (locationName, startDate, winner = "Driver A") => ({
    eventStatus: "Finished",
    locationName,
    locationFlag: "FI",
    startDate,
    results: { driverResults: [{ name: winner }, { name: "Driver B" }] }
  });
  const division = (divisionName, events) => ({
    divisionName,
    displayName: divisionName,
    events
  });

  beforeEach(() => {
    leagueRef.getDriverInDivision = name => ({ name, nationality: "SE" });
  });

  test("lists the three latest finished events, newest first, for a single division", () => {
    const events = [
      finished("Poland", "2026-06-22"),
      finished("Sweden", "2026-07-06"),
      finished("Croatia", "2026-07-13"),
      finished("Finland", "2026-09-11"),
      { eventStatus: "Active", locationName: "Chile", startDate: "2026-09-18" }
    ];
    const rows = getLastCompletedEvents({ pro: division("pro", events) });
    expect(rows.map(row => row.name)).toEqual(["Finland", "Croatia", "Sweden"]);
    expect(rows.map(row => row.eventIndex)).toEqual([3, 2, 1]);
  });

  test("lists only the latest finished event per division when there are several", () => {
    const rows = getLastCompletedEvents({
      pro: division("pro", [
        finished("Poland", "2026-06-22"),
        finished("Sweden", "2026-07-06")
      ]),
      am: division("am", [finished("Poland", "2026-06-22")])
    });
    expect(rows.map(row => [row.divisionId, row.name])).toEqual([
      ["pro", "Sweden"],
      ["am", "Poland"]
    ]);
  });

  test("skips finished events without a winner", () => {
    const noWinner = { ...finished("Finland", "2026-09-11") };
    noWinner.results = { driverResults: [] };
    const rows = getLastCompletedEvents({
      pro: division("pro", [finished("Sweden", "2026-07-06"), noWinner])
    });
    expect(rows.map(row => row.name)).toEqual(["Sweden"]);
  });
});

describe("getDivisionPanels", () => {
  test("pairs each season with its own division's battle", () => {
    const panels = getDivisionPanels(
      [{ divisionId: "b" }, { divisionId: "a" }],
      [{ divisionId: "a" }, { divisionId: "b" }]
    );
    expect(
      panels.map(({ battle, season }) => [battle.divisionId, season.divisionId])
    ).toEqual([
      ["a", "a"],
      ["b", "b"]
    ]);
  });

  test("keeps a season without a battle in its own place", () => {
    const panels = getDivisionPanels(
      [{ divisionId: "a" }, { divisionId: "c" }],
      [{ divisionId: "a" }, { divisionId: "b" }, { divisionId: "c" }]
    );
    expect(
      panels.map(({ battle, season }) => [
        battle && battle.divisionId,
        season.divisionId
      ])
    ).toEqual([
      ["a", "a"],
      [null, "b"],
      ["c", "c"]
    ]);
  });
});
