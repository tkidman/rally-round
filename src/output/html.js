const moment = require("moment");

const fs = require("fs");
const Handlebars = require("handlebars");
const debug = require("debug")("tkidman:rally-round:output:html");

const { leagueRef, getCarByName } = require("../state/league");
const {
  getDriverData,
  getHeaderLocations,
  getAllResults,
  getLocation
} = require("./shared");
const {
  outputPath,
  templatePath,
  getCountryForAnyCode,
  eventStatuses,
  getDuration,
  formatDuration,
  useNationalityAsTeam,
  DNF_STAGE_TIME,
  MAX_TOTAL_TIME
} = require("../shared");
const { processFantasyResults } = require("../fantasy/fantasyCalculator");
const { getLocalization } = require("./localization");
const { allLeagues } = require("../state/allLeagues");
const { isEmpty, isNil } = require("lodash");
// const { eventStatuses } = require("../shared");

// Register Handlebars helpers
Handlebars.registerHelper("eq", (a, b) => a === b);

// Done here, not in processing, so it also applies to an already-processed league.
Handlebars.registerHelper("resultClass", value => {
  if (value === null || value === undefined || value === "") {
    return "is-empty";
  }
  const text = String(value).toUpperCase();
  if (text === "DNF" || text === "DQ" || text === "DSQ") {
    return "is-dnf";
  }
  if (text === "DNS") {
    return "is-dns";
  }
  return "is-score";
});

let compiledNavigation = null;
let compiledEventNav = null;
let compiledLayout = null;

const writeFantasyHTML = (fantasyResults, links) => {
  const data = processFantasyResults(fantasyResults);

  const _t = fs.readFileSync(`${templatePath}/fantasyTeams.hbs`).toString();
  const team_template = Handlebars.compile(_t);
  const team_nav = getNavigationHTML("team", "fantasy", links);
  const teamData = {
    teams: data.teams,
    bestBuy: data.bestBuy,
    navigation: team_nav
  };

  const _d = fs.readFileSync(`${templatePath}/fantasyDrivers.hbs`).toString();
  const driver_template = Handlebars.compile(_d);
  const driver_nav = getNavigationHTML("driver", "fantasy", links);
  const driverData = {
    drivers: data.drivers,
    navigation: driver_nav,
    prices: data.prices
  };

  const _r = fs.readFileSync(`${templatePath}/fantasyRosters.hbs`).toString();
  const rosters_template = Handlebars.compile(_r);
  const roster_nav = getNavigationHTML("rosters", "fantasy", links);
  const rosterData = {
    teams: data.teams,
    navigation: roster_nav,
    prices: data.prices,
    backgroundStyle: leagueRef.getBackgroundStyle(),
    logo: leagueRef.league.logo
  };

  fs.writeFileSync(
    `./${outputPath}/website/team-fantasy-standings.html`,
    team_template(teamData)
  );
  fs.writeFileSync(
    `./${outputPath}/website/driver-fantasy-standings.html`,
    driver_template(driverData)
  );
  fs.writeFileSync(
    `./${outputPath}/website/rosters-fantasy-standings.html`,
    rosters_template(rosterData)
  );
};

// Placement events grade each stage time against a division's benchmark
// times: beat the first and you are in the top band, miss them all and you
// are in the last. The band is emitted as a class rather than a hex colour so
// the stylesheet can render it legibly - the old inline fills were built for
// a white table.
const getStageBenchmarkBands = (stageTimes, benchmarks) => {
  if (!stageTimes) return undefined;
  const out = [];
  for (let i = 0; i < stageTimes.length; i++) {
    const time = timeToSeconds(stageTimes[i]);
    const obj = { time: stageTimes[i], band: benchmarks ? "is-band-4" : null };
    if (benchmarks) {
      for (let j = 0; j < benchmarks[i].length; j++) {
        if (time < timeToSeconds(benchmarks[i][j])) {
          obj.band = `is-band-${j + 1}`;
          break;
        }
      }
    }
    out.push(obj);
  }
  return out;
};

const timeToSeconds = time => {
  const _t = time.split(":");
  return _t[0] * 60 + parseFloat(_t[1].replace(",", "."));
};

const getEventNavHTML = (links, headerLocations, currentEventIndex) => {
  if (!headerLocations || headerLocations.length === 0) return "";
  return compiledEventNav({
    links,
    // Copied, not mutated: the standings table shares this array.
    secondary: headerLocations.map(location => ({
      ...location,
      active: location.eventId === currentEventIndex
    }))
  });
};

const getNavigationHTML = (currentPage, currentMenu, links, currentView) => {
  Object.keys(links).forEach(menu => {
    if (menu === "active") return;
    links[menu].forEach(link => {
      link.active = link.name === currentPage && menu === currentMenu;
      if (link.active) {
        links.active = link;
        links.active.menu = currentMenu;
      }
    });
  });
  const resultsLinks = (links.driver || [])
    .map(link => {
      // overall hangs off the league, not leagueRef.divisions.
      const division =
        link.name === "overall"
          ? leagueRef.league.overall
          : leagueRef.divisions[link.name];
      if (!division || !division.events || division.events.length === 0) {
        return null;
      }
      return {
        ...link,
        href: `./${getResultsFileName({
          divisionName: division.divisionName,
          eventIndex: division.events.length - 1
        })}`
      };
    })
    .filter(Boolean);
  const activeView =
    currentView || (currentPage === "home" ? "home" : "standings");

  return compiledNavigation({
    links,
    resultsLinks,
    hasMultipleResults: resultsLinks.length > 1,
    hasMultipleDriverStandings: (links.driver || []).length > 1,
    hasMultipleTeamStandings: (links.team || []).length > 1,
    homeActive: activeView === "home",
    resultsActive: activeView === "results",
    driverStandingsActive:
      activeView === "standings" && currentMenu === "driver",
    teamStandingsActive: activeView === "standings" && currentMenu === "team",
    primaryResultsHref: resultsLinks[0]?.href,
    primaryDriverHref: links.driver?.[0]?.href,
    primaryTeamHref: links.team?.[0]?.href,
    endTime: leagueRef.endTime,
    activeCountry: leagueRef.activeCountryCode,
    logo: leagueRef.league.logo,
    siteTitlePrefix: leagueRef.league.siteTitlePrefix,
    localization: getLocalization()
  });
};

// Helper functions for home page data aggregation
const getHomeDivisions = divisions => {
  return Object.fromEntries(
    Object.entries(divisions || {}).filter(
      ([, division]) => !division.hideDriverStandingsLink
    )
  );
};

const getActiveEvents = divisions => {
  const activeEvents = [];

  Object.entries(divisions || {}).forEach(([divisionName, division]) => {
    (division.events || []).forEach((event, eventIndex) => {
      if (event.eventStatus === eventStatuses.active) {
        const eventLocation = getLocation(event);
        activeEvents.push({
          name: event.name || event.locationName || eventLocation.countryName,
          location: eventLocation.countryName || "",
          division: division.displayName || divisionName,
          divisionId: division.divisionName || divisionName,
          eventIndex
        });
      }
    });
  });

  return activeEvents;
};

const getTotalRounds = division =>
  (division.events || []).length + (division.upcomingEvents || []).length;

// Live event first, then the next on the calendar, then the round that ended the season.
const getHomeHero = divisions => {
  const localization = getLocalization();
  const entries = Object.entries(divisions || {});

  const buildHero = (divName, division, event, round, state) => {
    const location = getLocation(event) || {};
    const name = event.name || event.locationName || location.countryName;
    const divisionId = division.divisionName || divName;
    const isUpcoming = state === "next";
    const statusLabels = {
      live: localization.live_now,
      next: localization.up_next,
      latest: localization.latest_result,
      complete: localization.season_complete
    };

    return {
      state,
      live: state === "live",
      statusLabel: statusLabels[state],
      divisionId,
      title: name,
      subtitle:
        location.countryName && location.countryName !== name
          ? location.countryName
          : null,
      locationCode: location.countryCode,
      divisionName: division.displayName || divName,
      roundNumber: round,
      totalRounds: getTotalRounds(division),
      startDate:
        isUpcoming && event.startDate
          ? moment(event.startDate).format("MMMM D, YYYY [at] h:mm A")
          : null,
      resultsHref: isUpcoming
        ? null
        : `./${divisionId}-${round - 1}-driver-results.html`,
      standingsHref: `./${divisionId}-driver-standings.html`
    };
  };

  const findEvent = status => {
    for (const [divName, division] of entries) {
      const events = division.events || [];
      const index = events.findIndex(event => event.eventStatus === status);
      if (index !== -1) {
        return { divName, division, event: events[index], round: index + 1 };
      }
    }
    return null;
  };

  const live = findEvent(eventStatuses.active);
  if (live) {
    return buildHero(
      live.divName,
      live.division,
      live.event,
      live.round,
      "live"
    );
  }

  for (const [divName, division] of entries) {
    const upcoming = (division.upcomingEvents || [])[0];
    if (upcoming && !upcoming.isPlaceholder) {
      return buildHero(
        divName,
        division,
        upcoming,
        (division.events || []).length + 1,
        "next"
      );
    }
  }

  for (const [divName, division] of entries) {
    const events = division.events || [];
    for (let index = events.length - 1; index >= 0; index--) {
      if (events[index].eventStatus === eventStatuses.finished) {
        return buildHero(
          divName,
          division,
          events[index],
          index + 1,
          (division.upcomingEvents || []).length ? "latest" : "complete"
        );
      }
    }
  }

  return null;
};

const buildRoundGroup = ([divName, division]) => {
  const localization = getLocalization();
  const divisionId = division.divisionName || divName;

  const processed = (division.events || []).map((event, eventIndex) => {
    const location = getLocation(event) || {};
    const finished = event.eventStatus === eventStatuses.finished;
    const winnerName = event.results?.driverResults?.[0]?.name;
    let winner = null;
    if (finished && winnerName) {
      winner = getDriverData(winnerName, divName).driver.name;
    }

    return {
      round: eventIndex + 1,
      name: event.name || event.locationName || location.countryName,
      locationCode: location.countryCode,
      state: finished ? "done" : "live",
      statusLabel: finished
        ? localization.round_finished
        : localization.round_live,
      winner,
      href: `./${divisionId}-${eventIndex}-driver-results.html`
    };
  });

  const upcoming = (division.upcomingEvents || []).map((event, index) => {
    const location = getLocation(event) || {};
    return {
      round: (division.events || []).length + index + 1,
      name: event.isPlaceholder
        ? localization.round_tba
        : event.name || event.locationName || location.countryName,
      locationCode: location.countryCode,
      state: "upcoming",
      statusLabel: localization.round_upcoming,
      winner: null,
      // No winner yet, so the card carries the date instead.
      startDate: event.startDate
        ? moment(event.startDate).format("MMM D, YYYY")
        : null,
      href: null
    };
  });

  return {
    divisionName: division.displayName || divName,
    divisionId,
    rounds: [...processed, ...upcoming]
  };
};

// Divisions on identical schedules share one calendar, linked to overall.
const roundSignature = rounds =>
  JSON.stringify(
    rounds.map(round => [
      round.round,
      round.name,
      round.locationCode,
      round.state,
      round.startDate || null
    ])
  );

const collapseSharedCalendar = groups => {
  const overall = leagueRef.league.overall;
  if (groups.length < 2 || !overall) return groups;

  const signature = roundSignature(groups[0].rounds);
  if (groups.some(group => roundSignature(group.rounds) !== signature)) {
    return groups;
  }

  const overallRounds = buildRoundGroup(["overall", overall]).rounds;
  return [
    {
      divisionName: null,
      divisionId: "overall",
      rounds: groups[0].rounds.map((round, index) => {
        const overallRound = overallRounds[index];
        return round.href && overallRound
          ? { ...round, winner: overallRound.winner, href: overallRound.href }
          : round;
      })
    }
  ];
};

const getRoundCards = divisions =>
  collapseSharedCalendar(
    Object.entries(divisions || {})
      .map(buildRoundGroup)
      .filter(group => group.rounds.length > 0)
  );

const getDivisionInfo = divisions => {
  return Object.entries(divisions || {})
    .map(([divisionName, division]) => ({
      name: division.displayName || divisionName,
      cars: division.cars || null,
      excludedCars: division.excludedCars || null
    }))
    .filter(info => info.cars || info.excludedCars);
};

const getRules = (league, divisions) => {
  const firstDivisionKey = Object.keys(divisions || {})[0];
  const firstDivision =
    firstDivisionKey && divisions ? divisions[firstDivisionKey] : null;

  return {
    dropRounds: league.dropLowestScoringRoundsNumber || 0,
    powerStagePoints:
      (firstDivision &&
        firstDivision.points &&
        firstDivision.points.powerStage) ||
      [],
    overallPointsTop5:
      (firstDivision &&
        firstDivision.points &&
        firstDivision.points.overall &&
        firstDivision.points.overall.slice(0, 5)) ||
      []
  };
};

// ADR is 0 for everyone until more rounds are run than are dropped.
const useDropRoundPoints = division => {
  const { league } = leagueRef;
  const dropRounds = league.dropLowestScoringRoundsNumber || 0;
  if (!dropRounds || !league.sortByDropRoundPoints) {
    return false;
  }
  const standingsEvents = getStandingsEvents(
    getEventsWithStandings(division.events || [], "driver")
  );
  const roundsWeight = standingsEvents.reduce(
    (total, event) => total + (event.enduranceRoundMultiplier || 1),
    0
  );
  return roundsWeight > dropRounds;
};

const getRankingPoints = (standing, dropRoundPoints) =>
  dropRoundPoints ? standing.totalPointsAfterDropRounds : standing.totalPoints;

const getTop3ByDivision = divisions => {
  return Object.keys(divisions || {}).map(divName => {
    const division = divisions[divName];
    try {
      const standingsData = transformForStandingsHTML(division, "driver");
      const dropRoundPoints = useDropRoundPoints(division);
      const top3 = (standingsData.rows || []).slice(0, 3).map(row => ({
        ...row,
        points: getRankingPoints(row.standing, dropRoundPoints),
        dropRoundPoints,
        hasTeamLogo: row.teamLogo && !row.teamLogo.includes("unknown.png")
      }));
      return {
        divisionName: standingsData.title || divName,
        divisionId: division.divisionName || divName,
        top3
      };
    } catch (e) {
      debug(`failed to compute top3 for division ${divName}: ${e}`);
      return {
        divisionName: division.displayName || divName,
        divisionId: divName,
        top3: []
      };
    }
  });
};

const getLastCompletedEvents = divisions => {
  const divisionEntries = Object.entries(divisions || {});
  const eventsPerDivision = divisionEntries.length === 1 ? 3 : 1;

  return divisionEntries.flatMap(([divName, division]) =>
    (division.events || [])
      .map((event, eventIndex) => ({ event, eventIndex }))
      .filter(
        ({ event }) =>
          event.eventStatus === eventStatuses.finished &&
          event.results?.driverResults?.[0]
      )
      .sort(
        (a, b) =>
          (b.event.startDate ? new Date(b.event.startDate) : 0) -
            (a.event.startDate ? new Date(a.event.startDate) : 0) ||
          b.eventIndex - a.eventIndex
      )
      .slice(0, eventsPerDivision)
      .map(({ event, eventIndex }) => {
        const winner = event.results.driverResults[0];
        const { driver, country } = getDriverData(winner.name, divName);
        const eventLocation = getLocation(event);
        return {
          name: event.name || event.locationName || eventLocation.countryName,
          location: eventLocation.countryName,
          locationCode: eventLocation.countryCode,
          divisionName: division.displayName || divName,
          divisionId: division.divisionName || divName,
          eventIndex,
          winner: driver.name,
          winnerCountry: country.code,
          margin:
            event.results.driverResults[1]?.entry?.totalDiff || "Dominant",
          totalEntries: event.results.driverResults.length
        };
      })
  );
};

const getChampionshipBattles = divisions => {
  return Object.keys(divisions || {})
    .map(divName => {
      const division = divisions[divName];
      try {
        const standingsData = transformForStandingsHTML(division, "driver");
        const rows = standingsData.rows || [];
        if (rows.length < 2) return null;

        const leader = rows[0];
        const secondPlace = rows[1];
        const dropRoundPoints = useDropRoundPoints(division);
        const leaderPoints = getRankingPoints(leader.standing, dropRoundPoints);
        const secondPlacePoints = getRankingPoints(
          secondPlace.standing,
          dropRoundPoints
        );
        const gap = leaderPoints - secondPlacePoints;

        const completedEvents = (division.events || []).filter(
          e => e.eventStatus === eventStatuses.finished
        ).length;
        const totalEvents =
          (division.events || []).length +
          (division.upcomingEvents?.length || 0);
        const eventsRemaining = totalEvents - completedEvents;

        const maxPointsPerEvent = division.points?.overall?.[0] || 25;
        const maxPowerStagePoints = division.points?.powerStage?.[0] || 0;
        const totalPointsRemaining = eventsRemaining * maxPointsPerEvent;

        return {
          divisionName: standingsData.title || divName,
          divisionId: division.divisionName || divName,
          leader: leader.driver.name,
          leaderCountry: leader.country.code,
          leaderPoints,
          secondPlace: secondPlace.driver.name,
          secondPlaceCountry: secondPlace.country.code,
          secondPlacePoints,
          dropRoundPoints,
          gap,
          // The trailing bar is a share of the leader's, not of an absolute scale.
          secondPlaceBarPercent:
            leaderPoints > 0
              ? Math.max(
                  0,
                  Math.round((secondPlacePoints / leaderPoints) * 100)
                )
              : 0,
          maxPointsPerEvent,
          maxPowerStagePoints,
          totalPointsRemaining,
          eventsRemaining,
          mathematicallyOpen: gap < totalPointsRemaining * 0.5,
          tightBattle: gap < maxPointsPerEvent * 0.5
        };
      } catch (e) {
        debug(`championship battle for division ${divName}: ${e}`);
        return null;
      }
    })
    .filter(Boolean);
};

const getNextEvent = divisions => {
  let nextEvent = null;

  Object.entries(divisions || {}).forEach(([divName, division]) => {
    const upcoming = division.upcomingEvents?.[0];

    if (upcoming && !upcoming.isPlaceholder && !nextEvent) {
      const upcomingLocation = getLocation(upcoming);

      nextEvent = {
        name:
          upcoming.name ||
          upcoming.locationName ||
          upcomingLocation.countryName,
        location: upcomingLocation.countryName || "",
        locationCode: upcomingLocation.countryCode,
        divisionName: division.displayName || divName,
        divisionId: division.divisionName || divName,
        startDate: upcoming.startDate
          ? moment(upcoming.startDate).format("MMMM D, YYYY [at] h:mm A")
          : null
      };
    }
  });

  return nextEvent;
};

const getCarStats = divisions => {
  const carPerformance = {};

  Object.entries(divisions || {}).forEach(([divName, division]) => {
    if (division.excludeFromCarPerformance) {
      return;
    }
    division.events.forEach(event => {
      if (
        event.eventStatus === eventStatuses.finished &&
        event.results?.driverResults
      ) {
        event.results.driverResults.forEach((result, index) => {
          const carName = result.entry?.vehicleName;
          if (!carName) return;

          if (!carPerformance[carName]) {
            carPerformance[carName] = {
              wins: 0,
              podiums: 0,
              entries: 0,
              totalPoints: 0
            };
          }

          carPerformance[carName].entries++;
          if (index === 0) carPerformance[carName].wins++;
          if (index < 3) carPerformance[carName].podiums++;
          carPerformance[carName].totalPoints += result.totalPoints || 0;
        });
      }
    });
  });

  const sortedCars = Object.entries(carPerformance)
    .map(([name, stats]) => ({
      name,
      ...stats,
      avgPoints: (stats.totalPoints / stats.entries).toFixed(1),
      winRate: ((stats.wins / stats.entries) * 100).toFixed(1)
    }))
    .sort((a, b) => b.wins - a.wins || b.avgPoints - a.avgPoints);

  if (sortedCars.length === 0) {
    return null;
  }

  return {
    mostWins: sortedCars[0] || null,
    bestAverage: sortedCars.sort((a, b) => b.avgPoints - a.avgPoints)[0] || null
  };
};

const getFormGuide = divisions => {
  const hotDrivers = [];

  Object.entries(divisions || {}).forEach(([divName, division]) => {
    const driverForm = {};

    const recentEvents = division.events
      .filter(e => e.eventStatus === eventStatuses.finished)
      .slice(-3);

    recentEvents.forEach(event => {
      event.results?.driverResults?.forEach((result, index) => {
        const driverName = result.name;
        if (!driverForm[driverName]) {
          driverForm[driverName] = {
            recentFinishes: [],
            wins: 0,
            podiums: 0
          };
        }

        driverForm[driverName].recentFinishes.push(index + 1);
        if (index === 0) driverForm[driverName].wins++;
        if (index < 3) driverForm[driverName].podiums++;
      });
    });

    Object.entries(driverForm)
      .filter(([_, form]) => form.wins >= 2 || form.podiums >= 3)
      .forEach(([name, form]) => {
        const { driver, country } = getDriverData(name, divName);
        hotDrivers.push({
          name: driver.name,
          country: country.code,
          wins: form.wins,
          podiums: form.podiums,
          recentFinishes: form.recentFinishes,
          divisionName: division.displayName || divName
        });
      });
  });

  return hotDrivers
    .sort((a, b) => b.wins - a.wins || b.podiums - a.podiums)
    .slice(0, 3);
};

const getSeasonStats = divisions => {
  const divisionStats = [];

  Object.entries(divisions || {}).forEach(([divName, division]) => {
    let completedEvents = 0;
    let totalEntries = 0;
    let totalDNFs = 0;
    let closestFinish = { margin: Infinity, event: null };
    const drivers = new Set();
    const winners = new Set();

    (division.events || []).forEach(event => {
      (event.results?.driverResults || []).forEach(result =>
        drivers.add(result.name)
      );
    });

    division.events.forEach(event => {
      if (event.eventStatus === eventStatuses.finished) {
        completedEvents++;
        const results = event.results?.driverResults || [];
        totalEntries += results.length;
        if (results[0]) {
          winners.add(results[0].name);
        }

        // A non-starter is flagged isDnfEntry too, so DNS rows are excluded here.
        const dnfs = results.filter(
          r => r.entry?.isDnfEntry && !r.entry?.isDnsEntry
        ).length;
        totalDNFs += dnfs;

        if (results.length >= 2 && results[1].entry?.totalDiff) {
          try {
            const margin = timeToSeconds(results[1].entry.totalDiff);
            if (margin < closestFinish.margin) {
              const { driver: winner } = getDriverData(
                results[0].name,
                divName
              );
              const { driver: secondPlace } = getDriverData(
                results[1].name,
                divName
              );
              const eventLocation = getLocation(event);
              closestFinish = {
                margin: results[1].entry.totalDiff,
                event:
                  event.name || event.locationName || eventLocation.countryName,
                location: eventLocation.countryName,
                winner: winner.name,
                secondPlace: secondPlace.name
              };
            }
          } catch (e) {
            // Skip events with malformed totalDiff times
            debug(`Could not parse totalDiff for closest finish: ${e.message}`);
          }
        }
      }
    });

    const avgEntriesPerEvent =
      completedEvents > 0 ? Math.round(totalEntries / completedEvents) : 0;
    const dnfRate =
      totalEntries > 0 ? ((totalDNFs / totalEntries) * 100).toFixed(1) : 0;

    const totalEvents =
      division.events.length + (division.upcomingEvents?.length || 0);

    divisionStats.push({
      divisionName: division.displayName || divName,
      divisionId: division.divisionName || divName,
      totalEvents,
      completedEvents,
      eventsRemaining: totalEvents - completedEvents,
      driverCount: drivers.size,
      uniqueWinners: winners.size,
      totalDnfs: totalDNFs,
      avgEntriesPerEvent,
      dnfRate,
      closestFinish: closestFinish.event ? closestFinish : null
    });
  });

  return divisionStats;
};

const getDivisionPanels = (battles, seasons) =>
  seasons
    .map(season => ({
      battle: battles.find(battle => battle.divisionId === season.divisionId),
      season
    }))
    .filter(panel => panel.battle);

const getHeroForHome = (hero, { multipleDivisions, sharedCalendar }) => {
  if (!hero) return hero;
  if (sharedCalendar) {
    return {
      ...hero,
      divisionName: null,
      hasMeta: !!hero.startDate,
      resultsHref:
        hero.resultsHref &&
        `./overall-${hero.roundNumber - 1}-driver-results.html`,
      standingsHref: "./overall-driver-standings.html"
    };
  }
  const divisionName = multipleDivisions ? hero.divisionName : null;
  return { ...hero, divisionName, hasMeta: !!(divisionName || hero.startDate) };
};

const transformForHomeHTML = league => {
  const homeDivisions = getHomeDivisions(league.divisions);
  const multipleDivisions = Object.keys(homeDivisions).length > 1;
  const roundGroups = getRoundCards(homeDivisions);
  const sharedCalendar =
    multipleDivisions &&
    roundGroups.length === 1 &&
    !roundGroups[0].divisionName;
  const hero = getHeroForHome(getHomeHero(homeDivisions), {
    multipleDivisions,
    sharedCalendar
  });
  const activeEvents = getActiveEvents(homeDivisions);
  const championshipBattles = getChampionshipBattles(homeDivisions);
  const seasonStats = getSeasonStats(homeDivisions);

  return {
    logo: league.logo,
    siteTitlePrefix: league.siteTitlePrefix,
    hero,
    activeEvents,
    // The hero takes the first active event; the rest are listed under it.
    otherActiveEvents: sharedCalendar
      ? []
      : hero
        ? activeEvents.filter(
            event =>
              event.divisionId !== hero.divisionId ||
              event.eventIndex !== hero.roundNumber - 1
          )
        : activeEvents,
    multipleDivisions,
    roundGroups,
    endTime: leagueRef.endTime,
    activeCountry: leagueRef.activeCountryCode,
    divisionInfo: getDivisionInfo(homeDivisions),
    rules: getRules(league, homeDivisions),
    top3ByDivision: getTop3ByDivision(homeDivisions),
    historicalSeasonLinks: league.historicalSeasonLinks || [],
    showTeamNameTextColumn: league.showTeamNameTextColumn,
    hideTeamLogoColumn: league.hideTeamLogoColumn,
    showCarPerformance: league.showCarPerformance !== false, // default true
    localization: getLocalization(),
    lastCompletedEvents: getLastCompletedEvents(homeDivisions),
    championshipBattles,
    nextEvent: getNextEvent(homeDivisions),
    carStats: getCarStats(homeDivisions),
    formGuide: getFormGuide(homeDivisions),
    divisionPanels: getDivisionPanels(championshipBattles, seasonStats)
  };
};

const writeHomeHTML = links => {
  const league = leagueRef.league;

  // Add home link for navigation
  links.home = [
    {
      name: "home",
      link: league.siteTitlePrefix,
      href: "./index.html",
      active: false
    }
  ];

  const data = transformForHomeHTML(league);

  const homeTemplateFile = `${templatePath}/home.hbs`;
  if (!fs.existsSync(homeTemplateFile)) {
    debug("no home html template found, returning");
    return;
  }
  const src = fs.readFileSync(homeTemplateFile).toString();
  const bodyTemplate = Handlebars.compile(src);
  const bodyHtml = bodyTemplate(data);

  const pageTitle = `${league.siteTitlePrefix} | Home`;

  const out = compiledLayout({
    body: bodyHtml,
    pageTitle,
    logo: league.logo,
    theme: league.theme,
    backgroundStyle: leagueRef.getBackgroundStyle(),
    navigation: getNavigationHTML("home", "home", links, null)
  });

  fs.writeFileSync(`./${outputPath}/website/index.html`, out);
};

const writeErrorHTML = links => {
  const data = {
    navigation: getNavigationHTML("", "", links, null),
    backgroundStyle: leagueRef.getBackgroundStyle(),
    logo: leagueRef.league.logo
  };
  const templateFile = `${templatePath}/error.hbs`;
  if (!fs.existsSync(templateFile)) {
    debug("no template found, returning");
    return;
  }
  const _t = fs.readFileSync(templateFile).toString();

  const template = Handlebars.compile(_t);
  const out = template(data);

  fs.writeFileSync(`./${outputPath}/website/error.html`, out);
};

const getLastUpdatedAt = () => {
  if (leagueRef.league.overrideLastUpdated) {
    return leagueRef.league.overrideLastUpdated;
  }
  return moment().utc().format();
};

// A live round is deliberately not counted as run: its points are still moving.
const getSeasonProgress = (division, localization) => {
  const totalRounds = getTotalRounds(division);
  if (!totalRounds) return null;
  const roundsRun = (division.events || []).filter(
    event => event.eventStatus === eventStatuses.finished
  ).length;
  const roundLabel =
    roundsRun === 1 ? localization.round_run : localization.rounds_run_plural;
  return `${roundsRun} ${localization.of} ${totalRounds} ${roundLabel}`;
};

const writeStandingsHTML = (division, type, links) => {
  if (getEventsWithStandings(division.events, type).length === 0) {
    debug(`no ${type} standings found for ${division.divisionName}, skipping`);
    return;
  }
  const data = transformForStandingsHTML(division, type);
  data.overall = division.divisionName === "overall";

  data.navigation = getNavigationHTML(division.divisionName, type, links);
  data.eventNav = getEventNavHTML(links, data.headerLocations);
  data.lastUpdatedAt = getLastUpdatedAt();

  data.siteTitlePrefix = leagueRef.league.siteTitlePrefix;
  if (data.title.toLowerCase() !== data.siteTitlePrefix.toLowerCase()) {
    data.pageContext = data.title;
  }
  data.standingsTitle =
    type === "team"
      ? data.localization.team_standings
      : data.localization.driver_standings;
  data.seasonProgress = getSeasonProgress(division, data.localization);

  const templateFile = `${templatePath}/${type}Standings.hbs`;
  const src = fs.readFileSync(templateFile).toString();
  const bodyTemplate = Handlebars.compile(src);
  const bodyHtml = bodyTemplate(data);

  const typeLabel =
    type === "driver"
      ? "Driver Standings"
      : type === "team"
        ? "Team Standings"
        : "Standings";

  const pageTitle = `${leagueRef.league.siteTitlePrefix} | ${
    data.title || division.divisionName
  } – ${typeLabel}`;

  const out = compiledLayout({
    body: bodyHtml,
    pageTitle,
    navigation: data.navigation,
    backgroundStyle: data.backgroundStyle,
    logo: leagueRef.league.logo,
    theme: leagueRef.league.theme
  });

  fs.writeFileSync(
    `./${outputPath}/website/${division.divisionName}-${type}-standings.html`,
    out
  );

  if (
    !fs.existsSync(`./${outputPath}/website/index.html`) &&
    leagueRef.league.useStandingsForHome
  ) {
    fs.writeFileSync(`./${outputPath}/website/index.html`, out);
  }
};

// Zones are a class, not an inline colour: the stylesheet owns how they look.
const getStandingZone = standing => {
  if (standing.dnsPenalty) {
    return "is-zone-penalty";
  }
  if (standing.promotionRelegation === 2) {
    return "is-zone-promotion-double";
  }
  if (standing.promotionRelegation === 1) {
    return "is-zone-promotion";
  }
  if (standing.promotionRelegation === -1) {
    return "is-zone-relegation";
  }
  return null;
};

const getTeamLogo = teamId => {
  if (fs.existsSync(`./assets/teams/${teamId}.png`)) {
    return `./assets/teams/${teamId}.png`;
  }
  if (fs.existsSync(`./assets/cars/${teamId}.png`)) {
    return `./assets/cars/${teamId}.png`;
  }
  if (teamId) {
    debug(`can't find logo for team id: ${teamId}`);
  }
  return `./assets/teams/unknown.png`;
};

const getAfterDropRoundMessage = () => {
  if (leagueRef.league.afterDropRoundMessage) {
    return leagueRef.league.afterDropRoundMessage;
  }
  if (leagueRef.league.dropLowestScoringRoundsNumber > 1) {
    return `*After Drop Rounds: total points after lowest ${leagueRef.league.dropLowestScoringRoundsNumber} scoring rounds removed`;
  }
  return "*After Drop Round: total points after lowest scoring round removed";
};

const getEventsWithStandings = (events, type) => {
  return events.filter(e => e.standings && e.standings[`${type}Standings`]);
};

// The active event is left out unless live points are shown.
const getStandingsEvents = eventsWithStandings => {
  if (
    leagueRef.endTime &&
    !leagueRef.showLivePoints() &&
    eventsWithStandings.length > 1
  ) {
    return eventsWithStandings.slice(0, -1);
  }
  return eventsWithStandings;
};

const transformForStandingsHTML = (division, type) => {
  const events = division.events;
  const headerLocations = getHeaderLocations(events);
  // Note: division.events only contains processed events (future events are in upcomingEvents)
  // but we still filter as a safety check for events without standings
  const eventsWithStandings = getEventsWithStandings(events, type);
  if (eventsWithStandings.length === 0) {
    throw new Error(
      `no ${type} standings available for ${division.divisionName}`
    );
  }
  const lastEvent = getStandingsEvents(eventsWithStandings).at(-1);
  const lastEventStandings = lastEvent.standings[`${type}Standings`];
  const rows = lastEventStandings.map((standing, standingIndex) => {
    const movement = {
      positive: standing.positionChange > 0,
      neutral: !standing.positionChange,
      negative: standing.positionChange < 0
    };

    const rawResults = getAllResults(standing.name, events, type);

    // Copied, not mutated: these results are shared with the results pages and JSON dump.
    const bestScore = Math.max(
      ...rawResults.map(result =>
        result && typeof result.pointsDisplay === "number"
          ? result.pointsDisplay
          : -1
      )
    );
    const droppedRoundIndexes = standing.droppedRoundIndexes || [];
    const results = rawResults.map((result, index) => {
      if (!result) {
        return result;
      }
      const isDropped = droppedRoundIndexes.includes(index);
      return {
        ...result,
        isBest: bestScore > 0 && result.pointsDisplay === bestScore,
        isDropped,
        droppedTitle: isDropped ? getLocalization().dropped : undefined
      };
    });

    // can be null for team overall
    const standingDivision = leagueRef.divisions[standing.divisionName];
    const divisionDisplayName =
      standingDivision &&
      (standingDivision.displayName || standingDivision.divisionName);
    const row = {
      results,
      standing,
      ...movement,
      divisionDisplayName,
      zone: getStandingZone(standing)
    };
    if (type === "driver") {
      const { driver, country, carBrand } = getDriverData(
        standing.name,
        standing.divisionName
      );
      return {
        ...row,
        car: carBrand,
        driver,
        country,
        teamLogo: getTeamLogo(driver.teamId),
        team2Logo: getTeamLogo(driver.team2Id)
      };
    } else {
      const country = useNationalityAsTeam(leagueRef, division)
        ? getCountryForAnyCode(standing.name)
        : null;
      return { ...row, teamLogo: getTeamLogo(standing.name), country };
    }
  });
  const driverStandingsNationalityAsTeam =
    type === "driver" && useNationalityAsTeam(leagueRef, division);
  return {
    headerLocations,
    rows,
    // don't show team for driver standings when we're using nationality as team, we already show the nationality column
    showTeam: leagueRef.hasTeams && !driverStandingsNationalityAsTeam,
    useNationalityAsTeam: useNationalityAsTeam(leagueRef, division),
    showCar:
      !leagueRef.league.hideCarColumnInStandings &&
      (leagueRef.hasCars || leagueRef.league.showCarsAlways),
    showCarName:
      !leagueRef.league.hideCarColumnInStandings &&
      leagueRef.league.showCarNameAsTextInStandings,
    title: division.displayName || division.divisionName,
    divisionName: division.divisionName,
    showPointsAfterDropRounds:
      leagueRef.league.dropLowestScoringRoundsNumber > 0,
    afterDropRoundMessage: getAfterDropRoundMessage(),
    backgroundStyle: leagueRef.getBackgroundStyle(),
    logo: leagueRef.league.logo,
    showTeamNameTextColumn: leagueRef.league.showTeamNameTextColumn,
    hideTeamLogoColumn:
      leagueRef.league.hideTeamLogoColumn &&
      !useNationalityAsTeam(leagueRef, division),
    localization: getLocalization(),
    team2ColumnName: leagueRef.league.team2ColumnName,
    showTeam2LogoColumn: !!leagueRef.league.team2ColumnName,
    fullResultsLink: getFullResultsLink(division)
  };
};

const hasPoints = (pointsField, rows) => {
  return rows.some(row => row[pointsField]);
};

const hiddenTimeDisplay = "--";

// DNF_STAGE_TIME and MAX_TOTAL_TIME are sort keys, not times, so they show a marker.
// Not used for DNS: a driver without a time may still start a live event.
const noTimeDisplay = "—";

// Durations, not clock times: drop a zero hour but keep real ones.
const compactStageTime = value => {
  if (typeof value !== "string") return value;
  const match = value.match(/^(\d+):(\d{2}:\d{2}(?:\.\d+)?)$/);
  if (!match) return value;
  const [, hours, remainder] = match;
  return Number(hours) === 0 ? remainder : `${Number(hours)}:${remainder}`;
};

// Gaps read most quickly in motorsport notation when leading zero units are
// omitted: +1.952, +2:06.986, +1:02:06.986. Non-time markers pass through.
const compactTimeDiff = value => {
  if (typeof value !== "string") return value;
  const match = value.match(/^([+-]?)(\d+):(\d{2}):(\d{2}(?:\.\d+)?)$/);
  if (!match) return value;

  const [, sign, hours, minutes, seconds] = match;
  if (Number(hours) > 0) {
    return `${sign}${Number(hours)}:${minutes}:${seconds}`;
  }
  if (Number(minutes) > 0) {
    return `${sign}${Number(minutes)}:${seconds}`;
  }
  return `${sign}${seconds.replace(/^0(?=\d)/, "")}`;
};

const getStageTimeDisplay = (result, event) => {
  if (event.hideTimesUntilEventEnd) {
    return hiddenTimeDisplay;
  }
  if (
    leagueRef.league.hideStageTimesUntilEventEnd &&
    event.eventStatus !== eventStatuses.finished
  ) {
    return hiddenTimeDisplay;
  }
  if (result.entry.stageTime === DNF_STAGE_TIME) {
    return noTimeDisplay;
  }
  return compactStageTime(formatDuration(getDuration(result.entry.stageTime)));
};

const getStageDiffDisplay = (result, event) => {
  if (event.hideStageDiffsUntilEventEnd) {
    return hiddenTimeDisplay;
  }
  if (
    leagueRef.league.hideStageDiffsUntilEventEnd &&
    event.eventStatus !== eventStatuses.finished
  ) {
    return hiddenTimeDisplay;
  }
  return compactTimeDiff(result.entry.stageDiff);
};

const getTotalTimeDisplay = (result, event) => {
  if (event.hideTimesUntilEventEnd) {
    return hiddenTimeDisplay;
  }
  if (
    leagueRef.league.hideStageTimesUntilEventEnd &&
    event.eventStatus !== eventStatuses.finished &&
    leagueRef.league.isRallySprint
  ) {
    return hiddenTimeDisplay;
  }
  if (result.entry.totalTime === MAX_TOTAL_TIME) {
    return noTimeDisplay;
  }
  return formatDuration(getDuration(result.entry.totalTime));
};

const getTotalDiffDisplay = (result, event) => {
  if (event.hideStageDiffsUntilEventEnd) {
    return hiddenTimeDisplay;
  }
  if (
    leagueRef.league.hideStageDiffsUntilEventEnd &&
    event.eventStatus !== eventStatuses.finished
  ) {
    return hiddenTimeDisplay;
  }
  return compactTimeDiff(result.entry.totalDiff);
};

const getFullResultsLink = (division, event) => {
  if (division.rbr && event && event.eventId) {
    return `https://rallysimfans.hu/rbr/rally_online.php?centerbox=rally_results.php&rally_id=${event.eventId}`;
  }
  if (division.wrc && division.wrc.length === 1) {
    return `https://racenet.com/ea_sports_wrc/clubs/${division.wrc[0].clubId}`;
  }
  return null;
};

const transformForDriverResultsHTML = (event, division, legIndex) => {
  const events = division.events;
  const divisionName = division.divisionName;
  const headerLocations = getHeaderLocations(events);
  const rows = event.results.driverResults.map((result, index) => {
    const resultDivision = leagueRef.divisions[result.divisionName];
    const { driver, country } = getDriverData(result.name, divisionName);
    if (leagueRef.league.placement)
      result.stageTimes = getStageBenchmarkBands(
        result.stageTimes,
        division.benchmarks
      );
    const entryCar = getCarByName(result.entry.vehicleName);
    return {
      ...result,
      position: index + 1,
      // Only the car recorded for this event; a DNS placeholder has no vehicleName.
      car: entryCar ? entryCar.brand : undefined,
      driver,
      teamLogo: getTeamLogo(driver.teamId),
      team2Logo: getTeamLogo(driver.team2Id),
      country,
      divisionDisplayName:
        resultDivision.displayName || resultDivision.divisionName,
      stageTimeDisplay: getStageTimeDisplay(result, event),
      stageDiffDisplay: getStageDiffDisplay(result, event),
      totalTimeDisplay: getTotalTimeDisplay(result, event),
      totalDiffDisplay: getTotalDiffDisplay(result, event)
    };
  });
  // Filtered on entry flags, not position: a retired driver still holds a position.
  const podium = rows
    .filter(row => !row.entry.isDnfEntry && !row.entry.isDnsEntry)
    .slice(0, 3);

  const data = {
    headerLocations,
    rows,
    podium,
    title: division.displayName || divisionName,
    showTeam: leagueRef.hasTeams && !useNationalityAsTeam(leagueRef, division),
    showTeamNameTextColumn: leagueRef.league.showTeamNameTextColumn,
    showCar: leagueRef.hasCars || leagueRef.league.showCarNameAsTextInResults,
    showCarName: leagueRef.league.showCarNameAsTextInResults,
    showPowerStage:
      !leagueRef.league.isRallySprint &&
      isNil(legIndex) &&
      hasPoints("powerStagePoints", rows),
    showPowerStagePoints: hasPoints("powerStagePoints", rows),
    showStagePoints: hasPoints("stagePoints", rows),
    // legPoints not supported for overall driver results yet
    showLegPoints:
      hasPoints("legPoints", rows) && !(divisionName === "overall"),
    event,
    location: getLocation(event),
    divisionName,
    backgroundStyle: leagueRef.getBackgroundStyle(),
    incorrectCarTimePenaltySeconds:
      leagueRef.league.incorrectCarTimePenaltySeconds,
    incorrectCarTimePenalty: !!leagueRef.league.incorrectCarTimePenaltySeconds,
    logo: leagueRef.league.logo,
    hideTeamLogoColumn: leagueRef.league.hideTeamLogoColumn,
    showSuperRallyColumn: leagueRef.league.showSuperRallyColumn,
    fullResultsLink: getFullResultsLink(division, event),
    localization: getLocalization(),
    team2ColumnName: leagueRef.league.team2ColumnName,
    showTeam2LogoColumn: !!leagueRef.league.team2ColumnName
  };
  const legDisplay = isNil(legIndex)
    ? ""
    : `${getLocalization().leg} ${legIndex + 1} `;
  const fullTitle = `${data.title} ${data.location.countryName} ${legDisplay}${
    getLocalization().driver_results
  }`;
  data.fullTitle = fullTitle;
  return data;
};

const getResultsFileName = ({ divisionName, eventIndex, legIndex }) => {
  const legIndexPath = !isNil(legIndex) ? `-${legIndex}` : "";
  return `${divisionName}-${eventIndex}${legIndexPath}-driver-results.html`;
};

const writeDriverResultsHTML = ({
  event,
  division,
  links,
  eventIndex,
  legIndex
}) => {
  const data = transformForDriverResultsHTML(event, division, legIndex);
  data.overall = division.divisionName === "overall";

  data.navigation = getNavigationHTML(
    division.divisionName,
    "driver",
    links,
    "results"
  );
  data.eventNav = getEventNavHTML(links, data.headerLocations, eventIndex);
  data.links = links;
  data.siteTitlePrefix = leagueRef.league.siteTitlePrefix;
  data.lastUpdatedAt = getLastUpdatedAt();
  if (data.title.toLowerCase() !== data.siteTitlePrefix.toLowerCase()) {
    data.pageContext = data.title;
  }
  data.roundNumber = eventIndex + 1;
  data.totalRounds =
    division.events.length + (division.upcomingEvents || []).length;
  data.resultsTitle = `${data.location.countryName} ${
    isNil(legIndex) ? "" : `${data.localization.leg} ${legIndex + 1} `
  }${data.localization.driver_results}`;
  if (eventIndex > 0) {
    data.previousEventHref = `./${getResultsFileName({
      divisionName: division.divisionName,
      eventIndex: eventIndex - 1,
      legIndex
    })}`;
  }
  if (eventIndex < division.events.length - 1) {
    data.nextEventHref = `./${getResultsFileName({
      divisionName: division.divisionName,
      eventIndex: eventIndex + 1,
      legIndex
    })}`;
  }

  const templateFile = `${templatePath}/eventResults.hbs`;
  const _t = fs.readFileSync(templateFile).toString();
  const bodyTemplate = Handlebars.compile(_t);
  const bodyHtml = bodyTemplate(data);

  const pageTitle = `${leagueRef.league.siteTitlePrefix} | ${
    data.fullTitle || "Home"
  }`;
  const out = compiledLayout({
    body: bodyHtml,
    pageTitle,
    navigation: data.navigation,
    backgroundStyle: data.backgroundStyle,
    logo: leagueRef.league.logo,
    theme: leagueRef.league.theme
  });

  fs.writeFileSync(
    `./${outputPath}/website/${getResultsFileName({
      divisionName: division.divisionName,
      eventIndex,
      legIndex
    })}`,
    out
  );
  if (
    division.divisionName === "overall" &&
    leagueRef.league.useResultsForHome
  ) {
    fs.writeFileSync(`./${outputPath}/website/index.html`, out);
  }
};

const addLinks = (links, name, type, displayName) => {
  const linkDisplay = displayName || name;
  if (!links[type]) {
    links[type] = [];
  }
  links[type].push({
    name,
    link: `${linkDisplay}`,
    href: `./${name}-${type}-standings.html`,
    active: false
  });
};

const addHistoricalLinks = links => {
  // Show all historical season links
  const allLinks = leagueRef.league.historicalSeasonLinks || [];
  links.historical = allLinks;
};

const addSeriesLinks = links => {
  links.series = allLeagues.reduce((seriesLinks, otherLeague) => {
    if (
      otherLeague.websiteName === leagueRef.league.websiteName &&
      otherLeague.subfolderName !== leagueRef.league.subfolderName &&
      !otherLeague.hideFromSeriesLinks
    ) {
      const subfolderName = otherLeague.subfolderName || "";
      seriesLinks.push({
        name: otherLeague.siteTitlePrefix,
        link: otherLeague.siteTitlePrefix,
        href: `/${subfolderName}`,
        active: false
      });
    }
    return seriesLinks;
  }, []);
};

const getHtmlLinks = () => {
  const league = leagueRef.league;
  const links = Object.values(league.divisions).reduce((links, division) => {
    const divisionName = division.divisionName;
    const displayName = division.displayName;
    if (leagueRef.hasTeams && !division.hideTeamStandingsLink) {
      addLinks(links, divisionName, "team", displayName);
    }
    if (!division.hideDriverStandingsLink) {
      addLinks(links, divisionName, "driver", displayName);
    }
    return links;
  }, {});
  if (leagueRef.includeOverall) {
    if (leagueRef.hasTeams) {
      addLinks(links, "overall", "team", getLocalization().overall);
    }
    addLinks(links, "overall", "driver", getLocalization().overall);
  }
  if (league.fantasy) {
    addLinks(links, "team", "fantasy");
    addLinks(links, "driver", "fantasy");
    addLinks(links, "rosters", "fantasy");
  }
  addHistoricalLinks(links);
  addSeriesLinks(links);
  return links;
};

const writeHTMLOutputForDivision = (division, links) => {
  writeStandingsHTML(division, "driver", links);
  if (leagueRef.hasTeams) {
    writeStandingsHTML(division, "team", links);
  }
  division.events.forEach((event, eventIndex) => {
    if (!isEmpty(event.driverLegsResults)) {
      for (let i = 0; i < event.driverLegsResults.length; i++) {
        const resultsFileName = getResultsFileName({
          divisionName: division.divisionName,
          eventIndex,
          legIndex: i
        });
        event.legs[i].legUrl = `./${resultsFileName}`;
        event.legs[i].legColumnHeader = `${getLocalization().leg} ${i + 1}`;
        const driverLegResults = event.driverLegsResults[i];
        const legEvent = {
          ...event,
          results: { driverResults: driverLegResults }
        };
        writeDriverResultsHTML({
          event: legEvent,
          division,
          links,
          eventIndex,
          legIndex: i
        });
      }
    }

    writeDriverResultsHTML({ event, division, links, eventIndex });
  });
};

const writeAllHTML = () => {
  const layoutTemplateFile = `${templatePath}/layout.hbs`;
  const layoutTemplate = fs.readFileSync(layoutTemplateFile).toString();
  compiledLayout = Handlebars.compile(layoutTemplate);

  const navigationTemplateFile = `${templatePath}/navigation.hbs`;
  const navTemplate = fs.readFileSync(navigationTemplateFile).toString();
  compiledNavigation = Handlebars.compile(navTemplate);

  const eventNavTemplateFile = `${templatePath}/eventNav.hbs`;
  const eventNavTemplate = fs.readFileSync(eventNavTemplateFile).toString();
  compiledEventNav = Handlebars.compile(eventNavTemplate);

  const links = getHtmlLinks();
  const league = leagueRef.league;
  if (!league.useStandingsForHome) {
    writeHomeHTML(links);
    writeErrorHTML(links);
  }
  for (const divisionName of Object.keys(league.divisions)) {
    const division = league.divisions[divisionName];
    writeHTMLOutputForDivision(division, links);
  }
  if (league.overall) {
    writeHTMLOutputForDivision(league.overall, links);
  }
  if (!fs.existsSync(`./${outputPath}/website/index.html`)) {
    writeHomeHTML(links);
    writeErrorHTML(links);
  }
  if (league.fantasy) {
    writeFantasyHTML(league.fantasy, links);
  }
};

module.exports = {
  writeAllHTML,
  // tests
  getStandingZone,
  useDropRoundPoints,
  getLastCompletedEvents,
  getDivisionPanels,
  getHomeHero,
  getHeroForHome,
  getRoundCards,
  compactStageTime,
  compactTimeDiff
};
