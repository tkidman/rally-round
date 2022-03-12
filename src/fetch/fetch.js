const { fetchRBREvents } = require("./rbr/fetchRBR");
const { fetchDirt2Events } = require("./dirt/fetchDirt");
const { fetchManualEvents } = require("./manual/fetchManual");

const fetchEvents = async (division, divisionName, getAllResults) => {
  if (division.rbr) {
    return await fetchRBREvents({ division, divisionName });
  } else if (division.manual) {
    return await fetchManualEvents({ division });
  }
  return await fetchDirt2Events(division, divisionName, getAllResults);
};

module.exports = {
  fetchEvents
};
