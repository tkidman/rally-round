const { leagueRef } = require("../state/league");
const locations = require("../state/constants/locations.json");
const vehicles = require("../state/constants/vehicles.json");
const { getCountryForDriver, getCountryByAlpha2Code } = require("../shared");
const debug = require("debug")("tkidman:dirt2-results:output:shared");

const getAllResults = (name, events, type) => {
  return events.map(event =>
    event.results[`${type}Results`].find(result => result.name === name)
  );
};

const getHeaderLocations = events => {
  const headerLocations = events.reduce((headerLocations, event, index) => {
    headerLocations.push({
      eventId: index,
      locationCode: getLocationCountryCode(event)
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
    ...getDriverData(standing.name)
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

const getDriverData = driverName => {
  const driver = leagueRef.getDriver(driverName);
  let country = getCountryForDriver(driver);
  const car = vehicles[driver.car];
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
  return getCountryByAlpha2Code(event.locationFlag).code;
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
