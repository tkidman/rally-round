const { leagueRef } = require("../state/league");
const locations = require("../state/constants/locations.json");
const countries = require("../state/constants/countries.json");
const vehicles = require("../state/constants/vehicles.json");
const debug = require("debug")("tkidman:dirt2-results:output:shared");

const getAllResults = (name, events, type) => {
  return events.map(event =>
    event.results[`${type}Results`].find(result => result.name === name)
  );
};

const getHeaderLocations = events => {
  const headerLocations = events.reduce((headerLocations, event) => {
    headerLocations.push(locations[event.location].countryCode);
    return headerLocations;
  }, []);
  return headerLocations;
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
  let country = countries[driver.nationality];
  if (!country) {
    debug(`no country found for ${driver.nationality} ${driver.name}`);
    country = countries["eLngRestOfWorld"];
  }
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

const getActiveCountry = () => {
  if (leagueRef.activeCountry)
    return locations[leagueRef.activeCountry].countryCode;
};

module.exports = {
  getAllResults,
  getHeaderLocations,
  getActiveCountry,
  getDriverStandingData,
  getTeamStandingData,
  getDriverData
};
