const moment = require("moment");

const fs = require("fs");
const Handlebars = require("handlebars");
const debug = require("debug")("tkidman:dirt2-results:output:html");

const { leagueRef } = require("../state/league");
const {
  getDriverData,
  getActiveCountry,
  getHeaderLocations,
  getAllResults
} = require("./shared");
const { outputPath, templatePath } = require("../shared");
const { processFantasyResults } = require("../fantasy/fantasyCalculator");
const locations = require("../state/constants/locations.json");
const { eventStatuses } = require("../shared");
const resultColours = ["#76FF6A", "#faff5d", "#ffe300", "#ff5858"];

const compiled_navigation = null;

const writePlacementResultsHTML = (event, division, links) => {
  const data = transformForDriverResultsHTML(event, division);
  const location = locations[event.location];
  data.overall = division.divisionName === "overall";

  const divisionName = data.overall
    ? "overall"
    : division.divisionName.substring(0, 4).toUpperCase();
  data.navigation = getNavigationHTML(event.location, divisionName, links);

  data.lastUpdatedAt = moment()
    .utc()
    .format();

  const templateFile = `${templatePath}/placementEventResults.hbs`;
  if (!fs.existsSync(templateFile)) {
    debug("no standings html template found, returning");
    return;
  }
  const _t = fs.readFileSync(templateFile).toString();

  const template = Handlebars.compile(_t);
  const out = template(data);

  fs.writeFileSync(
    `./${outputPath}/website/${location.countryCode}-${divisionName}-driver-results.html`,
    out
  );
};

const writePlacementOutput = () => {
  const { league } = leagueRef;

  const links = Object.keys(league.divisions).reduce((links, divisionName) => {
    let division = divisionName.substring(0, 4).toUpperCase();
    if (divisionName === "jrc33") division = "overall";
    if (Object.keys(links).indexOf(division) === -1) {
      links[division] = ["grc", "usa", "nzl"].reduce((_l, loc) => {
        _l.push({
          link: loc,
          href: `./${loc}-${division}-driver-results.html`,
          active: false
        });
        return _l;
      }, []);
    }
    return links;
  }, {});

  Object.keys(league.divisions).forEach(divisionName => {
    const division = league.divisions[divisionName];
    const divisionEvents = division.events;
    divisionEvents.forEach(event =>
      writePlacementResultsHTML(event, division, links)
    );
  });
  if (league.overall) {
    const overallEvents = league.overall.events;
    overallEvents.forEach(event =>
      writePlacementResultsHTML(event, league.overall, links)
    );
  }
};

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
    prices: data.prices
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
      link.active = link.link === currentPage && menu === currentMenu;
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
    activeCountry: getActiveCountry()
  });
};

const writeHomeHTML = links => {
  const data = {
    navigation: getNavigationHTML("", "", links, null)
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

const writeStandingsHTML = (division, type, links) => {
  const data = transformForHTML(division, type);
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
  if (!fs.existsSync(standingsTemplateFile)) {
    debug("no standings html template found, returning");
    return;
  }
  const _t = fs.readFileSync(standingsTemplateFile).toString();

  const template = Handlebars.compile(_t);
  const out = template(data);

  fs.writeFileSync(
    `./${outputPath}/website/${division.divisionName}-${type}-standings.html`,
    out
  );
};

const transformForHTML = (division, type) => {
  const events = division.events;
  const headerLocations = getHeaderLocations(events);
  let lastEvent = events[events.length - 1];
  if (
    lastEvent.eventStatus !== eventStatuses.finished &&
    !leagueRef.league.showLivePoints &&
    events.length > 1
  ) {
    lastEvent = events[events.length - 2];
  }
  const rows = lastEvent.standings[`${type}Standings`].map(standing => {
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
    const row = {
      results,
      standing,
      ...movement,
      divisionDisplayName
    };
    if (type === "driver") {
      const { driver, country, carBrand } = getDriverData(standing.name);
      return { ...row, car: carBrand, driver, country };
    }
    return row;
  });
  return {
    headerLocations,
    rows,
    showTeam: leagueRef.hasTeams,
    showCar: leagueRef.hasCars,
    title: division.displayName || division.divisionName,
    logo: division.logo || "jrc_round.jpg",
    divisionName: division.divisionName
  };
};

const transformForDriverResultsHTML = (event, division) => {
  const divisionName = division.divisionName;
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
      country,
      divisionDisplayName:
        resultDivision.displayName || resultDivision.divisionName
    };
  });
  return {
    rows,
    title: division.displayName || divisionName,
    logo: division.logo || "jrc_round.jpg",
    showTeam: leagueRef.hasTeams,
    showCar: leagueRef.hasCars,
    event,
    location: locations[event.location],
    divisionName
    // stages: rows[0].stageTimes
  };
};

const writeDriverResultsHTML = (event, division, links) => {
  const data = transformForDriverResultsHTML(event, division);
  const location = locations[event.location];
  data.overall = division.divisionName === "overall";

  data.navigation = getNavigationHTML(division.divisionName, "driver", links);

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
    `./${outputPath}/website/${division.divisionName}-${location.countryCode}-driver-results.html`,
    out
  );
};

const writeHTMLOutputForDivision = (division, links) => {
  writeStandingsHTML(division, "driver", links);
  if (leagueRef.hasTeams) {
    writeStandingsHTML(division, "team", links);
  }
  division.events.forEach(event =>
    writeDriverResultsHTML(event, division, links)
  );
};

module.exports = {
  writeHomeHTML,
  writeFantasyHTML,
  writePlacementOutput,
  writeHTMLOutputForDivision
};
