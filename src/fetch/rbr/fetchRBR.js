const {
  formatDuration,
  getDuration,
  recalculateDiffs,
  getCountryByAlpha2Code,
  eventStatuses
} = require("../../shared");
const Papa = require("papaparse");
const moment = require("moment-timezone");
const { leagueRef } = require("../../state/league");
const { fetchResults } = require("../../api/rbr/rbrApi");

const processCsv = (eventResultsCsv, event) => {
  const results = Papa.parse(eventResultsCsv, {
    header: true,
    skipEmptyLines: true
  });
  // convert into racenetLeaderboardStages -> entries (per stage)
  const resultRows = results.data;
  const numStages = event.numStages;
  const racenetLeaderboardStages = Array.from(Array(numStages), () => ({
    entries: []
  }));
  resultRows.forEach(row => {
    const stageDuration = moment.duration(parseFloat(row.time3), "seconds");
    const commonResult = {
      name: row.user,
      isDnfEntry: false,
      vehicleName: row.car,
      vehicleClass: row.car_group,
      nationality: row.nationality,
      comment: row.comment,
      stageTime: formatDuration(stageDuration)
    };
    const stageIndex = row.stage_no - 1;
    racenetLeaderboardStages[stageIndex].entries.push(commonResult);
  });

  // calc total time
  for (let i = 0; i < numStages; i++) {
    const stageResults = racenetLeaderboardStages[i].entries;
    stageResults.forEach(result => {
      if (i === 0) {
        result.totalTime = result.stageTime;
      } else {
        const previousResult = racenetLeaderboardStages[i - 1].entries.find(
          prevResult => prevResult.name === result.name
        );
        result.totalTime = formatDuration(
          getDuration(previousResult.totalTime).add(
            getDuration(result.stageTime)
          )
        );
      }
    });
    recalculateDiffs(stageResults);
  }
  return {
    racenetLeaderboardStages,
    ...event
  };
};

const fetchEvent = async event => {
  const eventFinished = isFinished(event);
  const eventResultsCsv = await fetchResults(
    event.rbrRallyId,
    isFinished(event)
  );
  const processedEvent = processCsv(eventResultsCsv, event);
  if (eventFinished) {
    processedEvent.eventStatus = eventStatuses.finished;
  }
  return processedEvent;
};

const isFinished = rally => {
  const rallyEndTime = moment.tz(rally.endTime, "CET");
  return rallyEndTime.isBefore(moment());
};

const getActiveEvent = ({ division }) => {
  const activeEvent = division.rbr.rallies.find(rally => {
    const rallyEndTime = moment.tz(rally.endTime, "CET");
    return rallyEndTime.isAfter(moment());
  });
  return activeEvent;
};

const setCurrentEventEndTime = activeEvent => {
  if (activeEvent) {
    leagueRef.endTime = moment
      .tz(activeEvent.endTime, "CET")
      .utc()
      .toISOString();
    leagueRef.activeCountryCode = getCountryByAlpha2Code(
      activeEvent.locationFlag
    ).code;
  }
};

const fetchRBREvents = async ({ division }) => {
  const activeEvent = getActiveEvent({ division });
  activeEvent.eventStatus = eventStatuses.active;
  setCurrentEventEndTime(activeEvent);
  const events = [];
  const rallies = division.rbr.rallies;
  for (const rally of rallies) {
    const fetchedEvent = await fetchEvent(rally);
    events.push(fetchedEvent);
  }
  return events;
};

module.exports = {
  fetchRBREvents,
  // tests
  processCsv
};
