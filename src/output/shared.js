const { leagueRef, getCarByName } = require("../state/league");
const locations = require("../state/constants/locations.json");
const { getCountryForDriver, getCountryByAlpha2Code } = require("../shared");
const debug = require("debug")("tkidman:rally-round:output:shared");

const getAllResults = (name, events, type) => {
  return events.map(event =>
    event.results[`${type}Results`].find(result => result.name === name)
  );
};

const getHeaderLocations = events => {
  const headerLocations = events.reduce((headerLocations, event, index) => {
    headerLocations.push({
      eventId: index,
      locationCode: getLocationCountryCode(event),
      disableLink:
        leagueRef.league.aggregateDriverResultsInOverall &&
        event.divisionName === "overall"
    });
    return headerLocations;
  }, []);
  return headerLocations;
};

const getHeaderLocationCodes = events => {
  return getHeaderLocations(events).map(location => location.locationCode);
};
const getDriverStandingData = (standing, events) => {
  const results = getAllResults(standing.name, events, "driver");
  const resultsTotalPoints = results.map(result => result.totalPoints);
  return {
    results,
    resultsTotalPoints,
    ...getDriverData(standing.name, standing.divisionName)
  };
};

const getTeamStandingData = (standing, events) => {
  const results = getAllResults(standing.name, events, "team");
  const resultsTotalPoints = results.map(result => result.totalPoints);
  return {
    results,
    resultsTotalPoints,
    team: standing.name
  };
};

const getDriverData = (driverName, divisionName) => {
  const driver = leagueRef.getDriverInDivision(driverName, divisionName);
  const country = getCountryForDriver(driver);
  const car = getCarByName(driver.car);
  let carBrand;
  if (!car) {
    if (driver.car) {
      debug(`no car found in lookup for ${driver.car}`);
    }
  } else {
    carBrand = car.brand;
  }
  return {
    driver,
    country,
    car,
    carBrand
  };
};

const getLocationCountryCode = event => {
  if (event.location) {
    return locations[event.location].countryCode;
  }
  if (getCountryByAlpha2Code(event.locationFlag)) {
    return getCountryByAlpha2Code(event.locationFlag).code;
  }
  return event.locationFlag;
};

const getLocation = event => {
  if (event.location) {
    return locations[event.location];
  }
  return {
    countryName: event.locationName,
    countryCode: getLocationCountryCode(event)
  };
};

module.exports = {
  getAllResults,
  getHeaderLocations,
  getDriverStandingData,
  getTeamStandingData,
  getDriverData,
  getLocationCountryCode,
  getLocation,
  getHeaderLocationCodes
};
