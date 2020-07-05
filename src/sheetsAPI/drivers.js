const { google } = require("googleapis");
const sheetId = "1pXEw_cU4EkWeuP2C3MorpUwUhg7LAnH2OaNjuWpLyww";

// Not in use - need to work out how to share the API key
const loadDrivers = async () => {
  const sheets = google.sheets({
    version: "v4"
  });
  const result = await sheets.spreadsheets.get({
    spreadsheetId: sheetId,
    auth: "API-key"
  });
  return result;
};

module.exports = loadDrivers;
