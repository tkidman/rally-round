const {
  formatDuration,
  getDuration,
  recalculateDiffs
} = require("../../shared");
const Papa = require("papaparse");
const { maxBy } = require("lodash");
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
  const numStages = parseInt(maxBy(resultRows, "stage_no").stage_no);
  const racenetLeaderboardStages = Array.from(Array(numStages), () => []);
  resultRows.forEach(row => {
    const stageDuration = moment.duration(parseFloat(row.time3), "seconds");
    const commonResult = {
      name: row.user,
      isDnfEntry: false,
      vehicleName: row.car,
      vehicleClass: row.car_group,
      countryCode: row.nationality,
      comment: row.comment,
      stageTime: formatDuration(stageDuration)
    };
    const stageIndex = row.stage_no - 1;
    racenetLeaderboardStages[stageIndex].push(commonResult);
  });

  // calc total time
  for (let i = 0; i < numStages; i++) {
    const stageResults = racenetLeaderboardStages[i];
    stageResults.forEach(result => {
      if (i === 0) {
        result.totalTime = result.stageTime;
      } else {
        const previousResult = racenetLeaderboardStages[i - 1].find(
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
  const eventResultsCsv = await fetchResults(event.rbrRallyId);
  return processCsv(eventResultsCsv, event);
};

const isFinished = rally => {
  const rallyEndTime = moment.tz(rally.endTime, "CET");
  return rallyEndTime.before(moment());
};

const setCurrentEventEndTime = ({ division }) => {
  const activeEvent = division.rbr.rallies.find(rally => {
    const rallyEndTime = moment.tz(rally.endTime, "CET");
    return rallyEndTime.after(moment());
  });

  if (activeEvent) {
    leagueRef.endTime = moment
      .tz(activeEvent.endTime, "CET")
      .utc()
      .toISOString();
    leagueRef.activeCountry = activeEvent.locationName;
  }
};

const fetchRBREvents = async ({ division, divisionName }) => {
  setCurrentEventEndTime({ division });
  const events = [];
  const rallies = division.rbr.rallies;
  for (const rally in rallies) {
    const fetchedEvent = await fetchEvent(rally, isFinished(rally));
    events.push(fetchedEvent);
  }
  return events;
};

module.exports = {
  fetchRBREvents,
  // tests
  processCsv
};
