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
  useNationalityAsTeam
} = require("../shared");
const { processFantasyResults } = require("../fantasy/fantasyCalculator");
const { getLocalization } = require("./localization");
const { allLeagues } = require("../state/allLeagues");
const { isEmpty, isNil } = require("lodash");
// const { eventStatuses } = require("../shared");
const resultColours = ["#76FF6A", "#faff5d", "#ffe300", "#ff5858"];

const colours = {
  red: "#ffb4b4",
  green: "#ccffc8",
  gold: "#ffd74e",
  grey: "#dcdcdc",
  default: ""
};

// Register Handlebars helpers
Handlebars.registerHelper("eq", (a, b) => a === b);

let compiledNavigation = null;
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

const getStageColours = (stageTimes, benchmarks) => {
  if (!stageTimes) return undefined;
  const out = [];
  const defaultColour = benchmarks ? "#ff5858" : "";
  // const defaultColour = "";
  for (let i = 0; i < stageTimes.length; i++) {
    const time = timeToSeconds(stageTimes[i]);
    const obj = { time: stageTimes[i], colour: defaultColour };
    if (benchmarks) {
      for (let j = 0; j < benchmarks[i].length; j++) {
        if (time < timeToSeconds(benchmarks[i][j])) {
          obj.colour = resultColours[j];
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

const getNavigationHTML = (
  currentPage,
  currentMenu,
  links,
  headerLocations
) => {
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
  return compiledNavigation({
    links,
    secondary: headerLocations,
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

const getTop3ByDivision = divisions => {
  return Object.keys(divisions || {}).map(divName => {
    const division = divisions[divName];
    try {
      const standingsData = transformForStandingsHTML(division, "driver");
      const top3 = (standingsData.rows || []).slice(0, 3).map(row => ({
        ...row,
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
  const lastEventsByDivision = [];

  Object.entries(divisions || {}).forEach(([divName, division]) => {
    let mostRecentInDivision = null;
    let mostRecentDate = null;
    let mostRecentEventIndex = null;

    (division.events || []).forEach((event, eventIndex) => {
      if (event.eventStatus === eventStatuses.finished) {
        const eventDate = event.startDate ? new Date(event.startDate) : null;
        if (!mostRecentDate || (eventDate && eventDate > mostRecentDate)) {
          mostRecentDate = eventDate;
          mostRecentEventIndex = eventIndex;
          const winner = event.results?.driverResults?.[0];
          if (winner) {
            const { driver, country } = getDriverData(winner.name, divName);
            const eventLocation = getLocation(event);
            mostRecentInDivision = {
              name:
                event.name || event.locationName || eventLocation.countryName,
              location: eventLocation.countryName,
              locationCode: eventLocation.countryCode,
              divisionName: division.displayName || divName,
              divisionId: division.divisionName || divName,
              eventIndex: mostRecentEventIndex,
              winner: driver.name,
              winnerCountry: country.code,
              margin:
                event.results.driverResults[1]?.entry?.totalDiff || "Dominant",
              totalEntries: event.results.driverResults.length
            };
          }
        }
      }
    });

    if (mostRecentInDivision) {
      lastEventsByDivision.push(mostRecentInDivision);
    }
  });

  return lastEventsByDivision;
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
        const gap =
          leader.standing.totalPoints - secondPlace.standing.totalPoints;

        const completedEvents = (division.events || []).filter(
          e => e.eventStatus === eventStatuses.finished
        ).length;
        const totalEvents =
          (division.events || []).length +
          (division.upcomingEvents?.length || 0);
        const eventsRemaining = totalEvents - completedEvents;

        const maxPointsPerEvent = division.points?.overall?.[0] || 25;
        const totalPointsRemaining = eventsRemaining * maxPointsPerEvent;

        return {
          divisionName: standingsData.title || divName,
          divisionId: division.divisionName || divName,
          leader: leader.driver.name,
          leaderCountry: leader.country.code,
          leaderPoints: leader.standing.totalPoints,
          secondPlace: secondPlace.driver.name,
          secondPlaceCountry: secondPlace.country.code,
          secondPlacePoints: secondPlace.standing.totalPoints,
          gap,
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

    if (upcoming && !nextEvent) {
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

    division.events.forEach(event => {
      if (event.eventStatus === eventStatuses.finished) {
        completedEvents++;
        const results = event.results?.driverResults || [];
        totalEntries += results.length;

        const dnfs = results.filter(r => r.entry?.isDnfEntry).length;
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
      totalEvents,
      completedEvents,
      eventsRemaining: totalEvents - completedEvents,
      avgEntriesPerEvent,
      dnfRate,
      closestFinish: closestFinish.event ? closestFinish : null
    });
  });

  return divisionStats;
};

const transformForHomeHTML = league => {
  const homeDivisions = getHomeDivisions(league.divisions);

  return {
    logo: league.logo,
    siteTitlePrefix: league.siteTitlePrefix,
    activeEvents: getActiveEvents(homeDivisions),
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
    championshipBattles: getChampionshipBattles(homeDivisions),
    nextEvent: getNextEvent(homeDivisions),
    carStats: getCarStats(homeDivisions),
    formGuide: getFormGuide(homeDivisions),
    seasonStats: getSeasonStats(homeDivisions)
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

const writeStandingsHTML = (division, type, links) => {
  if (getEventsWithStandings(division.events, type).length === 0) {
    debug(`no ${type} standings found for ${division.divisionName}, skipping`);
    return;
  }
  const data = transformForStandingsHTML(division, type);
  data.overall = division.divisionName === "overall";

  data.navigation = getNavigationHTML(
    division.divisionName,
    type,
    links,
    data.headerLocations
  );
  data.lastUpdatedAt = getLastUpdatedAt();

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

const getStandingColour = standing => {
  if (standing.dnsPenalty) {
    return colours.grey;
  }
  if (standing.promotionRelegation === 2) {
    return colours.gold;
  }
  if (standing.promotionRelegation === 1) {
    return colours.green;
  }
  if (standing.promotionRelegation === -1) {
    return colours.red;
  }
  return colours.default;
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
  let lastEvent = eventsWithStandings[eventsWithStandings.length - 1];
  if (
    leagueRef.endTime &&
    !leagueRef.showLivePoints() &&
    eventsWithStandings.length > 1
  ) {
    lastEvent = eventsWithStandings[eventsWithStandings.length - 2];
  }
  const lastEventStandings = lastEvent.standings[`${type}Standings`];
  const rows = lastEventStandings.map((standing, standingIndex) => {
    const movement = {
      positive: standing.positionChange > 0,
      neutral: !standing.positionChange,
      negative: standing.positionChange < 0
    };

    const results = getAllResults(standing.name, events, type);

    // can be null for team overall
    const standingDivision = leagueRef.divisions[standing.divisionName];
    const divisionDisplayName =
      standingDivision &&
      (standingDivision.displayName || standingDivision.divisionName);
    const colour = getStandingColour(standing);
    const row = {
      results,
      standing,
      ...movement,
      divisionDisplayName,
      colour
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
  return formatDuration(getDuration(result.entry.stageTime));
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
  return result.entry.stageDiff;
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
  return result.entry.totalDiff;
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
    const { driver, country, carBrand } = getDriverData(
      result.name,
      divisionName
    );
    if (leagueRef.league.placement)
      result.stageTimes = getStageColours(
        result.stageTimes,
        division.benchmarks
      );
    const entryCar = getCarByName(result.entry.vehicleName);
    return {
      ...result,
      position: index + 1,
      car: entryCar ? entryCar.brand : carBrand,
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
  const data = {
    headerLocations,
    rows,
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
    data.headerLocations
  );
  data.links = links;
  data.siteTitlePrefix = leagueRef.league.siteTitlePrefix;
  data.lastUpdatedAt = getLastUpdatedAt();

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
  colours,
  // tests
  getStandingColour
};
