const { getCountryByAlpha2Code, eventStatuses } = require("../../shared");
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
    leagueRef.activeCountryCode = getCountryByAlpha2Code(
      activeEvent.locationFlag
    ).code;
  }
};

const populateManualEvents = resultRows => {
  const eventsById = {};
  resultRows.forEach(row => {
    const eventId = row.EventId;
    if (!eventsById[eventId]) {
      eventsById[eventId] = {
        endTime: row.EventEndTime,
        eventId,
        locationFlag: row.EventCountry,
        leaderboadStages: [{ entries: [] }],
        eventStatus: moment(row.EventEndTime).isBefore(moment())
          ? eventStatuses.finished
          : null
      };
    }
    const driver = leagueRef.getDriver(row.Driver);
    const entry = {
      name: row.Driver,
      isDnfEntry: !!row.DNF,
      vehicleName: row.car || driver.car,
      vehicleClass: row.car || driver.car,
      nationality: driver.nationality,
      stageTime: row.PSTime,
      totalTime: row.TotalTime
    };
    eventsById[eventId].leaderboadStages[0].entries.push(entry);
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
