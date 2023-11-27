const debug = require("debug")("tkidman:rally-round:fetch:fetchWRC");

const {
  fetchChampionshipIds,
  fetchChampionship,
  fetchLeaderboard
} = require("../../api/wrc");
const {
  eventStatuses,
  getSummedTotalTime,
  recalculateDiffs,
  mergeEvent,
  getCountryForAnyCode
} = require("../../shared");
const { leagueRef } = require("../../state/league");
const locations = require("../../state/constants/locations.json");
const { last, slice, reverse, map, keyBy, indexOf } = require("lodash");
const { readFileSync } = require("fs");
const Papa = require("papaparse");

const wrcEventStatuses = {
  1: eventStatuses.active,
  2: eventStatuses.finished
};

const wrcNationalitiesFile = readFileSync(
  "./src/fetch/wrc/nationalities.csv",
  "utf8"
);
const wrcNationalities = Papa.parse(wrcNationalitiesFile, {
  header: true,
  skipEmptyLines: true
}).data;
const wrcNationalitiesById = keyBy(wrcNationalities, "id");

const getCountryCodeFromNationalityId = nationalityId => {
  const nationality = wrcNationalitiesById[nationalityId];
  const alpha2code = nationality.code;
  const country = getCountryForAnyCode(alpha2code.toUpperCase());
  return country.code;
};
const fetchEventsForClub = async ({
  club,
  division,
  divisionName,
  getAllResults
}) => {
  // const recentResults = await fetchRecentResults(club.clubId);
  let championshipIds = [...club.championshipIds];
  if (club.includeNextChampionships) {
    const allChampionshipIds = await fetchChampionshipIds(club.clubId);
    // so most recent championship is last in the array
    const reversedChampionshipIds = reverse(allChampionshipIds);
    const startingChampionshipId = last(club.championshipIds);
    const startingChampionshipIndex = indexOf(
      reversedChampionshipIds,
      startingChampionshipId
    );
    championshipIds = slice(reversedChampionshipIds, startingChampionshipIndex);
  }
  const allRacenetEvents = [];
  for (const championshipId of championshipIds) {
    const championship = await fetchChampionship(championshipId);
    allRacenetEvents.push(...championship.events);
  }
  const events = await fetchEvents({
    allRacenetEvents,
    getAllResults,
    clubId: club.clubId
  });
  return events;
};

const fetchEvents = async ({ allRacenetEvents, getAllResults, clubId }) => {
  const events = [];
  for (const racenetEvent of allRacenetEvents) {
    const leaderboardStages = [];
    for (let i = 0; i < racenetEvent.stages.length; i++) {
      if (getAllResults || i === 0 || i === racenetEvent.stages.length - 1) {
        let racenetLeaderboard = await fetchLeaderboard({
          clubId,
          leaderboardId: racenetEvent.stages[i].leaderboardID,
          cacheLeaderboard:
            wrcEventStatuses[racenetEvent.status] === eventStatuses.finished
        });
        const convertedResults = map(racenetLeaderboard.entries, entry => {
          const commonResult = {
            name: entry.displayName,
            isDnfEntry: false,
            vehicleName: entry.vehicle,
            nationality: getCountryCodeFromNationalityId(entry.nationalityID),
            stageTime: entry.time.substring(0, 12),
            totalTime: entry.timeAccumulated.substring(0, 12)
          };
          return commonResult;
        });
        const leaderboardStage = { entries: convertedResults };
        leaderboardStages.push(leaderboardStage);
      }
    }
    events.push({
      location: racenetEvent.eventSettings.location,
      eventStatus: wrcEventStatuses[racenetEvent.status],
      leaderboardStages
    });
    if (wrcEventStatuses[racenetEvent.status] === eventStatuses.active) {
      leagueRef.endTime = racenetEvent.absoluteCloseDate;
      leagueRef.activeCountryCode =
        locations[racenetEvent.eventSettings.location].countryCode;
    }
  }
  return events;
};

const recalculateEventDiffs = event => {
  event.leaderboardStages.forEach(stage => {
    recalculateDiffs(stage.entries);
  });
};

const adjustAppendStageTimes = (stage, lastStageBeforeAppend) => {
  const adjustedStageEntries = [];
  lastStageBeforeAppend.entries.forEach(lastStageBeforeAppendEntry => {
    const appendEntryForDriver = stage.entries.find(
      appendEntry => appendEntry.name === lastStageBeforeAppendEntry.name
    );
    if (appendEntryForDriver) {
      const appendEntry = { ...appendEntryForDriver };
      appendEntry.totalTime = getSummedTotalTime(
        appendEntryForDriver,
        lastStageBeforeAppendEntry
      );
      adjustedStageEntries.push(appendEntry);
    }
  });
  stage.entries = adjustedStageEntries;
  return stage;
};

const appendResults = ({ eventToAppendTo, eventToAppendFrom }) => {
  const lastStageBeforeAppend =
    eventToAppendTo.leaderboardStages[
      eventToAppendTo.leaderboardStages.length - 1
    ];
  eventToAppendFrom.leaderboardStages.forEach(stage => {
    const adjustedStage = adjustAppendStageTimes(stage, lastStageBeforeAppend);
    eventToAppendTo.leaderboardStages.push(adjustedStage);
  });
};

const appendEvents = ({ division, mergedEvents }) => {
  division.appendEventIndexesToPrevious.forEach(eventToAppendFromIndex => {
    const eventToAppendFrom = mergedEvents[eventToAppendFromIndex];
    const eventToAppendTo = mergedEvents[eventToAppendFromIndex - 1];
    if (!eventToAppendTo || !eventToAppendFrom) {
      debug("invalid append event config, ignoring");
    } else {
      mergedEvents.splice(eventToAppendFromIndex, 1);
      appendResults({ eventToAppendTo, eventToAppendFrom });
    }
  });
};

const fetchWRCEvents = async (division, divisionName, getAllResults) => {
  const mergedEvents = [];
  for (let club of division.wrc) {
    debug(`fetching event for club ${club.clubId}`);
    const events = await fetchEventsForClub({
      club,
      division,
      divisionName,
      getAllResults
    });
    if (mergedEvents.length === 0) {
      mergedEvents.push(...events);
    } else {
      for (let i = 0; i < events.length; i++) {
        mergeEvent(mergedEvents[i], events[i]);
      }
    }
  }
  // appendEventIndexesToPrevious is an array of ints. Each int will cause the event at that index to have
  // its stages appended to the event at the previous index, and the event is removed from the array.
  // If merging more than one event it's best to order the array from high to low as the length of the events array changes as the process goes on.
  if (division.appendEventIndexesToPrevious) {
    appendEvents({ division, mergedEvents });
  }
  if (division.wrc.length > 1 || division.appendEventIndexesToPrevious) {
    mergedEvents.forEach(event => {
      recalculateEventDiffs(event);
    });
  }
  return mergedEvents;
};

module.exports = {
  fetchWRCEvents,
  // tests
  appendEvents,
  recalculateEventDiffs
};
