const { fetchRBREvents } = require("./rbr/fetchRBR");
const { fetchDirt2Events } = require("./dirt/fetchDirt");

const fetchEvents = async (division, divisionName, getAllResults) => {
  if (division.rbr) {
    return await fetchRBREvents({ division, divisionName });
  }
  return await fetchDirt2Events(division, divisionName, getAllResults);
};

module.exports = {
  fetchEvents
};
