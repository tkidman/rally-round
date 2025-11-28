const { eventStatuses, getCountryForAnyCode } = require("../../shared");
const debug = require("debug")("tkidman:fetchManual");
const moment = require("moment-timezone");
const { leagueRef } = require("../../state/league");
const { loadSheetAndTransform } = require("../../api/sheets/sheets");

const getActiveEvent = events => {
  const activeEvent = events.find(event => {
    const rallyEndTime = moment(event.endTime);
    return rallyEndTime.isAfter(moment());
  });
  return activeEvent;
};

const setCurrentEventEndTime = activeEvent => {
  if (activeEvent) {
    leagueRef.endTime = activeEvent.endTime;
    leagueRef.activeCountryCode = getCountryForAnyCode(
      activeEvent.locationFlag
    ).code;
  }
};

const populateManualEvents = resultRows => {
  const eventsById = {};
  resultRows.forEach(row => {
    const eventId = row.EventId;
    if (!eventsById[eventId]) {
      const countryCode = row.EventCountry;
      const country = getCountryForAnyCode(countryCode);
      eventsById[eventId] = {
        endTime: row.EventEndTime,
        eventId,
        locationFlag: countryCode,

        locationName:
          row.EventName ||
          row.EventLocation ||
          country.name ||
          `Event ${eventId}`,
        leaderboardStages: [{ entries: [] }],
        eventStatus: moment(row.EventEndTime).isBefore(moment())
          ? eventStatuses.finished
          : null
      };
    }
    let driver = leagueRef.getLeagueDriver(row.Driver);
    if (!driver) {
      debug(`unable to find driver details for ${row.Driver}, using defaults`);
      driver = {
        name: row.Driver,
        car: "Unknown",
        nationality: "RX"
      };
      leagueRef.addDriver(driver);
    }
    const entry = {
      name: row.Driver,
      isDnfEntry: !!row.DNF,
      vehicleName: row.Car || driver.car,
      vehicleClass: row.Car || driver.car,
      nationality: driver.nationality || "RX",
      stageTime: row.PSTime || row.TotalTime || "00:00:00.000",
      totalTime: row.TotalTime || "00:00:00.000"
    };
    eventsById[eventId].leaderboardStages[0].entries.push(entry);
  });
  const events = Object.values(eventsById);

  // could use end time here instead
  events.sort((a, b) => a.eventId - b.eventId);

  const activeEvent = getActiveEvent(events);
  if (activeEvent) {
    activeEvent.eventStatus = eventStatuses.active;
    setCurrentEventEndTime(activeEvent);
  }

  return events;
};

const fetchManualEvents = async ({ division }) => {
  const resultRows = await loadSheetAndTransform({
    sheetId: division.manual.sheetId,
    tabName: "results"
  });
  return populateManualEvents(resultRows);
};

module.exports = {
  fetchManualEvents,
  // testing
  populateManualEvents
};
