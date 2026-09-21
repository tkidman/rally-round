const {
  useDropRoundPoints,
  getLastCompletedEvents,
  getDivisionPanels,
  getHomeHero,
  getHeroForHome,
  getRoundCards,
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

  test("drops the season of a division without a battle", () => {
    const panels = getDivisionPanels(
      [{ divisionId: "a" }, { divisionId: "c" }],
      [{ divisionId: "a" }, { divisionId: "b" }, { divisionId: "c" }]
    );
    expect(
      panels.map(({ battle, season }) => [battle.divisionId, season.divisionId])
    ).toEqual([
      ["a", "a"],
      ["c", "c"]
    ]);
  });
});

describe("getHeroForHome", () => {
  const hero = (fields = {}) => ({
    divisionId: "pro",
    divisionName: "Pro",
    roundNumber: 3,
    startDate: null,
    resultsHref: "./pro-2-driver-results.html",
    standingsHref: "./pro-driver-standings.html",
    ...fields
  });

  test("points a shared calendar's hero at overall and drops the division", () => {
    expect(
      getHeroForHome(hero(), { multipleDivisions: true, sharedCalendar: true })
    ).toMatchObject({
      divisionName: null,
      hasMeta: false,
      resultsHref: "./overall-2-driver-results.html",
      standingsHref: "./overall-driver-standings.html"
    });
  });

  test("keeps the division when divisions run different calendars", () => {
    expect(
      getHeroForHome(hero(), { multipleDivisions: true, sharedCalendar: false })
    ).toMatchObject({
      divisionName: "Pro",
      hasMeta: true,
      resultsHref: "./pro-2-driver-results.html"
    });
  });

  test("drops the division name for a single division", () => {
    expect(
      getHeroForHome(hero(), {
        multipleDivisions: false,
        sharedCalendar: false
      })
    ).toMatchObject({ divisionName: null, hasMeta: false });
  });

  test("keeps the meta line for an upcoming round's start date", () => {
    expect(
      getHeroForHome(hero({ startDate: "June 22, 2026", resultsHref: null }), {
        multipleDivisions: true,
        sharedCalendar: true
      })
    ).toMatchObject({ divisionName: null, hasMeta: true, resultsHref: null });
  });
});

describe("getRoundCards", () => {
  const finished = (name, winner) => ({
    eventStatus: "Finished",
    name,
    locationName: "Finland",
    locationFlag: "FI",
    results: { driverResults: [{ name: winner }] }
  });
  const division = (divisionName, winner) => ({
    divisionName,
    displayName: divisionName,
    events: [finished("Secto Rally Finland", winner)],
    upcomingEvents: [
      { name: "Rally Sweden", locationFlag: "SE", startDate: "2031-01-01" }
    ]
  });

  beforeEach(() => {
    leagueRef.getDriverInDivision = name => ({ name, nationality: "SE" });
    leagueRef.league = {
      overall: {
        divisionName: "overall",
        events: [{ ...finished(undefined, "Overall Winner"), name: undefined }]
      }
    };
  });

  test("merges identical division calendars even though overall lacks upcoming rounds and names", () => {
    const groups = getRoundCards({
      pro: division("pro", "Pro Winner"),
      am: division("am", "Am Winner")
    });
    expect(groups).toHaveLength(1);
    expect(groups[0].divisionName).toBeNull();
    expect(
      groups[0].rounds.map(round => [round.name, round.winner, round.href])
    ).toEqual([
      [
        "Secto Rally Finland",
        "Overall Winner",
        "./overall-0-driver-results.html"
      ],
      ["Rally Sweden", null, null]
    ]);
  });

  test("keeps separate calendars when the divisions differ", () => {
    const am = division("am", "Am Winner");
    am.upcomingEvents[0].name = "Rally Poland";
    expect(
      getRoundCards({ pro: division("pro", "Pro Winner"), am })
    ).toHaveLength(2);
  });

  test("keeps separate calendars when there is no overall", () => {
    leagueRef.league = {};
    expect(
      getRoundCards({
        pro: division("pro", "Pro Winner"),
        am: division("am", "Am Winner")
      })
    ).toHaveLength(2);
  });
});

describe("planned placeholder rounds", () => {
  const placeholder = { isPlaceholder: true, eventStatus: "Future" };
  const division = () => ({
    divisionName: "pro",
    displayName: "Pro",
    events: [
      {
        eventStatus: "Finished",
        name: "Secto Rally Finland",
        locationName: "Finland",
        locationFlag: "FI",
        results: { driverResults: [{ name: "Winner" }] }
      }
    ],
    upcomingEvents: [placeholder, placeholder, placeholder]
  });

  beforeEach(() => {
    leagueRef.getDriverInDivision = name => ({ name, nationality: "SE" });
    leagueRef.league = {};
  });

  test("hero shows the latest result instead of a placeholder or season complete", () => {
    expect(getHomeHero({ pro: division() })).toMatchObject({
      state: "latest",
      statusLabel: "Latest result",
      title: "Secto Rally Finland",
      roundNumber: 1,
      totalRounds: 4,
      resultsHref: "./pro-0-driver-results.html"
    });
  });

  test("calendar lists placeholders as rounds to be announced", () => {
    const [group] = getRoundCards({ pro: division() });
    expect(
      group.rounds.map(round => [round.round, round.name, round.state])
    ).toEqual([
      [1, "Secto Rally Finland", "done"],
      [2, "To be announced", "upcoming"],
      [3, "To be announced", "upcoming"],
      [4, "To be announced", "upcoming"]
    ]);
  });
});
