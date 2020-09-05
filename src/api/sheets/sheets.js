const { google } = require("googleapis");
const debug = require("debug")("tkidman:dirt2-results:sheets");
const sheetId = "1M-JZAPJMp0ASihKi7z2kHMiL9BFi7PQlakvvl7pcal0";

const loadSheetAndTransform = async ({ sheetId, tabName }) => {
  const result = await loadSheet({ sheetId, tabName });
  const rows = result.data.values;
  // assumes first row is header row
  const headerRow = rows[0];
  const dataRows = rows.slice(1);
  const dataRowObjects = dataRows.map(dataRow => {
    return dataRow.reduce((dataRowObject, cell, index) => {
      dataRowObject[headerRow[index]] = cell;
      return dataRowObject;
    }, {});
  });
  return dataRowObjects;
};

const loadSheet = async ({ sheetId, tabName }) => {
  const sheets = google.sheets({
    version: "v4"
  });
  const result = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    auth: process.env.GOOGLE_SHEETS_API_KEY,
    range: tabName
  });
  return result;
};

const createSheetsClient = () => {
  const clientId = process.env.DIRT_SHEETS_CLIENT_ID;
  const clientSecret = process.env.DIRT_SHEETS_CLIENT_SECRET;
  const refreshToken = process.env.DIRT_SHEETS_REFRESH_TOKEN;

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    "http://localhost"
  );

  const tokens = {
    refresh_token: refreshToken
  };
  oauth2Client.setCredentials(tokens);

  const sheets = google.sheets({
    version: "v4",
    auth: oauth2Client
  });
  return sheets;
};

const updateClubsSheet = async clubs => {
  const sheets = createSheetsClient();
  await sheets.spreadsheets.values.clear({
    spreadsheetId: sheetId,
    range: "A2:F"
  });

  const sortedClubs = clubs.sort((a, b) => b.memberCount - a.memberCount);
  const values = sortedClubs.reduce((acc, club) => {
    acc.push([
      club.name,
      club.memberCount,
      club.clubAccessType === "Moderated",
      club.hasActiveChampionship,
      club.description
    ]);
    return acc;
  }, []);
  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    resource: { values },
    range: "A1",
    valueInputOption: "USER_ENTERED"
  });
  debug(`sheet updated with ${values.length} rows`);
};

const updateResultsSheet = async (rows, sheetId, tabName) => {
  const sheets = createSheetsClient();
  try {
    // try and load the tab
    await loadSheet({ sheetId, tabName });
  } catch (err) {
    if (err.message.startsWith("Unable to parse range")) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: sheetId,
        resource: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: tabName
                }
              }
            }
          ]
        }
      });
    } else {
      throw err;
    }
  }
  await sheets.spreadsheets.values.clear({
    spreadsheetId: sheetId,
    range: `${tabName}!A1:Z`
  });

  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    resource: { values: rows },
    range: `${tabName}!A1`,
    valueInputOption: "USER_ENTERED"
  });
  debug(`sheet updated with ${rows.length} rows`);
};

module.exports = {
  loadSheetAndTransform,
  updateClubsSheet,
  updateResultsSheet
};
