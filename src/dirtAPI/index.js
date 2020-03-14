const axios = require("axios");
const debug = require("debug")("tkidman:dirt2-results:dirtAPI");

const { cookie, xsrfh } = require("../../creds");

const fetchChampionships = async clubId => {
  const response = await axios({
    method: "GET",
    url: `https://dirtrally2.com/api/Club/${clubId}/championships`,
    headers: { Cookie: cookie }
  });
  debug(response.data);
};

const fetchRecentResults = async clubId => {
  const response = await axios({
    method: "GET",
    url: `https://dirtrally2.com/api/Club/${clubId}/recentResults`,
    headers: { Cookie: cookie, "RaceNet.XSRFH": xsrfh }
  });
  debug(JSON.stringify(response.data, null, 2));
};

const fetchEventResults = async ({ eventId, challengeId }) => {
  const payload = {
    challengeId,
    selectedEventId: 0,
    stageId: "11",
    page: 1,
    pageSize: 100,
    orderByTotalTime: true,
    platformFilter: "None",
    playerFilter: "Everyone",
    filterByAssists: "Unspecified",
    filterByWheel: "Unspecified",
    nationalityFilter: "None",
    eventId
  };
  const response = await axios({
    method: "POST",
    url: "https://dirtrally2.com/api/Leaderboard",
    headers: { Cookie: cookie.trim(), "RaceNet.XSRFH": xsrfh.trim() },
    data: payload
  });
  debug(`event results retrieved: ${eventId}`);
  return response.data;
};

module.exports = { fetchChampionships, fetchRecentResults, fetchEventResults };
