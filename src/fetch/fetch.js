const { fetchRBREvents } = require("./rbr/fetchRBR");
const { fetchDirt2Events } = require("./dirt/fetchDirt");
const { fetchManualEvents } = require("./manual/fetchManual");
const { fetchWRCEvents } = require("./wrc/fetchWRC");

const fetchEvents = async (division, divisionName, getAllResults) => {
  if (division.rbr) {
    return await fetchRBREvents({ division, divisionName });
  } else if (division.manual) {
    return await fetchManualEvents({ division });
  } else if (division.wrc) {
    return await fetchWRCEvents(division, divisionName, getAllResults);
  }
  return await fetchDirt2Events(division, divisionName, getAllResults);
};

module.exports = {
  fetchEvents
};
