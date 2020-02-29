const axios = require("axios");
const { cookie, xsrfh } = require("./hidden/creds");

const fetchChampionships = async () => {
  const response = await axios({
    method: "GET",
    url: "https://dirtrally2.com/api/Club/232735/championships",
    headers: { "Cookie": cookie }
  });
  console.log(response.data);
};

const fetchRecentResults = async () => {
  const response = await axios({
    method: "GET",
    url: "https://dirtrally2.com/api/Club/232735/recentResults",
    headers: { "Cookie": cookie , "RaceNet.XSRFH": xsrfh },
  });
  console.log(JSON.stringify(response.data, null, 2));
};

const fetchEventResults = async () => {
  const payload = {"challengeId":"67014","selectedEventId":0,"stageId":"11","page":1,"pageSize":100,"orderByTotalTime":true,"platformFilter":"None","playerFilter":"Everyone","filterByAssists":"Unspecified","filterByWheel":"Unspecified","nationalityFilter":"None","eventId":"67465"};
  const response = await axios({
    method: "POST",
    url: "https://dirtrally2.com/api/Leaderboard",
    headers: { "Cookie": cookie , "RaceNet.XSRFH": xsrfh },
    data: payload
  });
  console.log(JSON.stringify(response.data, null, 2));
};

// fetchChampionships();
fetchEventResults().catch(err => console.log(err));
// fetchRecentResults().catch(err => console.log(err));