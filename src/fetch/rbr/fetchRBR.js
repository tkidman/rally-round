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
const { fetchResults, fetchStandings } = require("../../api/rbr/rbrApi");
const { keyBy } = require("lodash");

// sometimes comments can contain invalid values leading to an invalid csv
const stripComments = eventResultsCsv => {
  const lines = eventResultsCsv.split("\n");
  const newLines = lines.map(line => {
    const columns = line.split(";");
    // comment column is the last column (13th), just use the first 12 columns
    const newColumns = columns.slice(0, 12);
    return newColumns.join(";");
  });
  return newLines.join("\n");
};

const processCsv = (eventResultsCsv, eventStandingsCsv, event) => {
  const standings = Papa.parse(eventStandingsCsv, {
    header: true,
    skipEmptyLines: true
  }).data;

  const standingsByUserName = keyBy(standings, "user_name");
  const strippedEventsResultCsv = stripComments(eventResultsCsv);

  const results = Papa.parse(strippedEventsResultCsv, {
    header: true,
    skipEmptyLines: true
  });
  // convert into leaderboardStages -> entries (per stage)
  const resultRows = results.data;
  const numStages = event.numStages;
  const leaderboadStages = Array.from(Array(numStages), () => ({
    entries: []
  }));
  resultRows.forEach(row => {
    const stageDuration = moment.duration(parseFloat(row.time3), "seconds");
    const superRally = standingsByUserName[row.user]
      ? Number(standingsByUserName[row.user].super_rally)
      : null;
    const commonResult = {
      name: row.user,
      isDnfEntry: false,
      vehicleName: row.car,
      vehicleClass: row.car_group,
      nationality: row.nationality,
      comment: row.comment,
      stageTime: formatDuration(stageDuration),
      superRally
    };
    const stageIndex = row.stage_no - 1;
    leaderboadStages[stageIndex].entries.push(commonResult);
  });

  // calc total time
  for (let i = 0; i < numStages; i++) {
    const stageResults = leaderboadStages[i].entries;
    stageResults.forEach(result => {
      if (i === 0) {
        result.totalTime = result.stageTime;
      } else {
        const previousResult = leaderboadStages[i - 1].entries.find(
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
    leaderboadStages,
    ...event
  };
};

const fetchEvent = async event => {
  const eventFinished = isFinished(event);
  const eventResultsCsv = await fetchResults(event.eventId, isFinished(event));
  const eventStandingsCsv = await fetchStandings(
    event.eventId,
    isFinished(event)
  );
  const processedEvent = processCsv(eventResultsCsv, eventStandingsCsv, event);
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
  if (activeEvent) {
    activeEvent.eventStatus = eventStatuses.active;
    setCurrentEventEndTime(activeEvent);
  }
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
