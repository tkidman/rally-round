process.env.DEBUG = "tkidman:*";

const axios = require("axios");
const moment = require("moment");
const debug = require("debug")("tkidman:rally-round:checker");

async function fetchWebsiteContent() {
  try {
    const response = await axios.get(
      "http://jrc-results.s3-website-ap-southeast-2.amazonaws.com/themed/"
    );
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch website content");
  }
}

async function checkLastUpdated() {
  const websiteContent = await fetchWebsiteContent();
  const regex = /Last updated at: (\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z)/;
  const match = websiteContent.match(regex);

  if (match && match[1]) {
    const lastUpdated = moment(match[1]);
    const currentTime = moment();
    const diffMinutes = currentTime.diff(lastUpdated, "minutes");

    if (diffMinutes > 20) {
      throw new Error("Last updated time is over 20 minutes ago");
    } else {
      debug("Last updated time is within 20 minutes");
    }
  } else {
    throw new Error("Last updated time not found in the website content");
  }
}

checkLastUpdated();
