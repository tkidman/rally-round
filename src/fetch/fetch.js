const { recalculateDiffsForEntries } = require("../shared");
const { getSummedTotalTime } = require("../shared");
const { fetchEventsForClub } = require("./dirt/fetchDirt");

const debug = require("debug")("tkidman:dirt2-results:fetch");

const mergeEvent = (mergedEvent, event) => {
  if (mergedEvent.location !== event.location) {
    throw new Error("multiclass championship but events do not line up.");
  }
  for (let i = 0; i < event.racenetLeaderboardStages.length; i++) {
    mergedEvent.racenetLeaderboardStages[i].entries.push(
      ...event.racenetLeaderboardStages[i].entries
    );
  }
};

const recalculateDiffs = event => {
  event.racenetLeaderboardStages.forEach(stage => {
    recalculateDiffsForEntries(stage.entries, "total");
    recalculateDiffsForEntries(stage.entries, "stage");
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

const appendResultsToPreviousEvent = (
  eventToAppendArray,
  mergedEvents,
  club
) => {
  debug(`appending results to previous event`);
  if (eventToAppendArray.length !== 1) {
    throw new Error(
      "append results returned wrong number of events, should only return 1 event."
    );
  }
  if (mergedEvents.length <= club.appendToEventIndex) {
    throw new Error(
      `invalid index ${club.appendToEventIndex} to append results to, only ${mergedEvents.length} events available`
    );
  }
  const event = mergedEvents[club.appendToEventIndex];
  const lastStageBeforeAppend =
    event.racenetLeaderboardStages[event.racenetLeaderboardStages.length - 1];
  const eventToAppend = eventToAppendArray[0];
  eventToAppend.racenetLeaderboardStages.forEach(stage => {
    const adjustedStage = adjustAppendStageTimes(stage, lastStageBeforeAppend);
    event.racenetLeaderboardStages.push(adjustedStage);
  });
};

const fetchEvents = async (division, divisionName, getAllResults) => {
  const mergedEvents = [];
  for (let club of division.clubs) {
    debug(`fetching event for club ${club.clubId}`);
    const events = await fetchEventsForClub({
      club,
      division,
      divisionName,
      getAllResults
    });
    if (club.appendToEventIndex === 0 || club.appendToEventIndex > 0) {
      appendResultsToPreviousEvent(events, mergedEvents, club);
    } else if (mergedEvents.length === 0) {
      mergedEvents.push(...events);
    } else {
      for (let i = 0; i < events.length; i++) {
        mergeEvent(mergedEvents[i], events[i]);
      }
    }
  }
  if (division.clubs.length > 1) {
    mergedEvents.forEach(event => {
      recalculateDiffs(event);
    });
  }
  return mergedEvents;
};

module.exports = {
  fetchEvents,
  // tests
  recalculateDiffsForEntries,
  appendResultsToPreviousEvent
};
