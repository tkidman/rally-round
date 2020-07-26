const { google } = require("googleapis");
const debug = require("debug")("tkidman:dirt2-results:sheets");

const loadSheet = async ({ sheetId, tabName }) => {
  const sheets = google.sheets({
    version: "v4"
  });
  try {
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      auth: process.env.GOOGLE_SHEETS_API_KEY,
      range: tabName
    });
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
  } catch (err) {
    debug(err);
    throw err;
  }
};

module.exports = { loadSheet };
