const moment = require("moment");

const fs = require("fs");
const Handlebars = require("handlebars");
const debug = require("debug")("tkidman:dirt2-results:output:html");

const { leagueRef } = require("../state/league");
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
  eventStatuses
} = require("../shared");
const { processFantasyResults } = require("../fantasy/fantasyCalculator");
const { getLocalization } = require("./localization");
// const { eventStatuses } = require("../shared");
const resultColours = ["#76FF6A", "#faff5d", "#ffe300", "#ff5858"];

const colours = {
  red: "#ffb4b4",
  green: "#ccffc8",
  gold: "#ffd74e",
  grey: "#dcdcdc",
  default: ""
};

const compiled_navigation = null;

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

  var _d = fs.readFileSync(`${templatePath}/fantasyDrivers.hbs`).toString();
  var driver_template = Handlebars.compile(_d);
  const driver_nav = getNavigationHTML("driver", "fantasy", links);
  const driverData = {
    drivers: data.drivers,
    navigation: driver_nav,
    prices: data.prices
  };

  var _r = fs.readFileSync(`${templatePath}/fantasyRosters.hbs`).toString();
  var rosters_template = Handlebars.compile(_r);
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
  let _t = time.split(":");
  return _t[0] * 60 + parseFloat(_t[1].replace(",", "."));
};

const getNavigationHTML = (
  currentPage,
  currentMenu,
  links,
  headerLocations
) => {
  if (compiled_navigation == null) {
    const navigationTemplateFile = `${templatePath}/navigation.hbs`;
    const _t = fs.readFileSync(navigationTemplateFile).toString();
    this.compiled_navigation = Handlebars.compile(_t);
  }
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
  return this.compiled_navigation({
    links,
    secondary: headerLocations,
    endTime: leagueRef.endTime,
    activeCountry: leagueRef.activeCountryCode,
    logo: leagueRef.league.logo,
    siteTitlePrefix: leagueRef.league.siteTitlePrefix,
    localization: getLocalization()
  });
};

const writeHomeHTML = links => {
  const data = {
    navigation: getNavigationHTML("", "", links, null),
    backgroundStyle: leagueRef.getBackgroundStyle(),
    logo: leagueRef.league.logo
  };
  const homeTemplateFile = `${templatePath}/home.hbs`;
  if (!fs.existsSync(homeTemplateFile)) {
    debug("no standings html template found, returning");
    return;
  }
  const _t = fs.readFileSync(homeTemplateFile).toString();

  const template = Handlebars.compile(_t);
  const out = template(data);

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

const writeStandingsHTML = (division, type, links) => {
  const data = transformForStandingsHTML(division, type);
  data.overall = division.divisionName === "overall";
  data.navigation = getNavigationHTML(
    division.divisionName,
    type,
    links,
    data.headerLocations
  );
  data.lastUpdatedAt = moment()
    .utc()
    .format();

  const standingsTemplateFile = `${templatePath}/${type}Standings.hbs`;
  const _t = fs.readFileSync(standingsTemplateFile).toString();

  const template = Handlebars.compile(_t);
  const out = template(data);

  fs.writeFileSync(
    `./${outputPath}/website/${division.divisionName}-${type}-standings.html`,
    out
  );
  if (!fs.existsSync(`./${outputPath}/website/index.html`)) {
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
  debug(`can't find logo for team id: ${teamId}`);
  return `./assets/teams/unknown.png`;
};

const transformForStandingsHTML = (division, type) => {
  const events = division.events;
  const headerLocations = getHeaderLocations(events);
  let lastEvent = events[events.length - 1];
  if (leagueRef.endTime && !leagueRef.showLivePoints() && events.length > 1) {
    lastEvent = events[events.length - 2];
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
      const { driver, country, carBrand } = getDriverData(standing.name);
      return {
        ...row,
        car: carBrand,
        driver,
        country,
        teamLogo: getTeamLogo(driver.teamId)
      };
    } else {
      const country = leagueRef.league.useNationalityAsTeam
        ? getCountryForAnyCode(standing.name)
        : null;
      return { ...row, teamLogo: getTeamLogo(standing.name), country };
    }
  });
  const driverStandingsNationalityAsTeam =
    type === "driver" && leagueRef.league.useNationalityAsTeam;
  return {
    headerLocations,
    rows,
    // don't show team for driver standings when we're using nationality as team, we already show the nationality column
    showTeam: leagueRef.hasTeams && !driverStandingsNationalityAsTeam,
    useNationalityAsTeam: leagueRef.league.useNationalityAsTeam,
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
    afterDropRoundMessage:
      leagueRef.league.afterDropRoundMessage ||
      "*After Drop Round: total points after lowest scoring round removed",
    backgroundStyle: leagueRef.getBackgroundStyle(),
    logo: leagueRef.league.logo,
    showTeamNameTextColumn: leagueRef.league.showTeamNameTextColumn,
    hideTeamLogoColumn: leagueRef.league.hideTeamLogoColumn,
    localization: getLocalization()
  };
};

const hasPoints = (pointsField, rows) => {
  return rows.some(row => row[pointsField]);
};

const getStageTimeDisplay = (result, event) => {
  if (
    leagueRef.league.hideStageTimesUntilEventEnd &&
    event.eventStatus !== eventStatuses.finished
  ) {
    return "";
  }
  return result.stageTime;
};

const transformForDriverResultsHTML = (event, division) => {
  const events = division.events;
  const divisionName = division.divisionName;
  const headerLocations = getHeaderLocations(events);
  const rows = event.results.driverResults.map((result, index) => {
    const resultDivision = leagueRef.divisions[result.divisionName];
    const { driver, country, carBrand } = getDriverData(result.name);
    if (leagueRef.league.placement)
      result.stageTimes = getStageColours(
        result.stageTimes,
        division.benchmarks
      );
    return {
      ...result,
      position: index + 1,
      car: carBrand,
      driver,
      teamLogo: getTeamLogo(driver.teamId),
      country,
      divisionDisplayName:
        resultDivision.displayName || resultDivision.divisionName,
      stageTimeDisplay: getStageTimeDisplay(result, event)
    };
  });
  return {
    headerLocations,
    rows,
    title: division.displayName || divisionName,
    showTeam: leagueRef.hasTeams && !leagueRef.league.useNationalityAsTeam,
    showCar: leagueRef.hasCars || leagueRef.league.showCarNameAsTextInResults,
    showCarName: leagueRef.league.showCarNameAsTextInResults,
    showPowerStagePoints: hasPoints("powerStagePoints", rows),
    showStagePoints: hasPoints("stagePoints", rows),
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
    fullResultsLink: division.rbr
      ? `https://rallysimfans.hu/rbr/rally_online.php?centerbox=rally_results.php&rally_id=${event.eventId}`
      : null,
    localization: getLocalization()
  };
};

const writeDriverResultsHTML = (event, division, links, eventIndex) => {
  const data = transformForDriverResultsHTML(event, division);
  data.overall = division.divisionName === "overall";

  data.navigation = getNavigationHTML(
    division.divisionName,
    "driver",
    links,
    data.headerLocations
  );

  data.lastUpdatedAt = moment()
    .utc()
    .format();

  const templateFile = `${templatePath}/eventResults.hbs`;
  if (!fs.existsSync(templateFile)) {
    debug("no standings html template found, returning");
    return;
  }
  const _t = fs.readFileSync(templateFile).toString();

  const template = Handlebars.compile(_t);
  const out = template(data);

  fs.writeFileSync(
    `./${outputPath}/website/${division.divisionName}-${eventIndex}-driver-results.html`,
    out
  );
};

const writeHTMLOutputForDivision = (division, links) => {
  writeStandingsHTML(division, "driver", links);
  if (leagueRef.hasTeams) {
    writeStandingsHTML(division, "team", links);
  }
  division.events.forEach((event, eventIndex) =>
    writeDriverResultsHTML(event, division, links, eventIndex)
  );
};

module.exports = {
  writeHomeHTML,
  writeErrorHTML,
  writeFantasyHTML,
  writeHTMLOutputForDivision,
  colours,
  // tests
  getStandingColour
};
