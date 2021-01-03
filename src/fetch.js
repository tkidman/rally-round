const { cachePath } = require("./shared");
const { recalculateDiffsForEntries } = require("./shared");
const fs = require("fs");
const { getSummedTotalTime } = require("./shared");

const { eventStatuses } = require("./shared");
const { fetchEventResults } = require("./api/dirt");
const { fetchChampionships } = require("./api/dirt");
const { fetchRecentResults } = require("./api/dirt");
const { leagueRef } = require("./state/league");
const debug = require("debug")("tkidman:dirt2-results:fetch");

const fetchEventsForClub = async (club, division, divisionName) => {
  const recentResults = await fetchRecentResults(club.clubId);
  const championships = await fetchChampionships(club.clubId);
  getEventEndTime(championships);
  const eventKeys = getEventKeysFromRecentResults({
    recentResults,
    championships,
    division,
    divisionName,
    club
  });
  const events = await fetchEventsFromKeys(
    eventKeys,
    leagueRef.league.getAllResults
  );

  if (club.cachedEvent) {
    const racenetLeaderboardStages = [];
    club.cachedEvent.files.forEach(fileName => {
      const leaderboard = JSON.parse(
        fs.readFileSync(`${cachePath}/${fileName}`, "utf8")
      );
      racenetLeaderboardStages.push(leaderboard);
    });
    const cachedEvent = {
      eventId: club.cachedEvent.eventId,
      divisionName,
      location: club.cachedEvent.location,
      eventStatus: eventStatuses.finished,
      racenetLeaderboardStages
    };
    events.splice(club.cachedEvent.index, 0, cachedEvent);
  }
  return events;
};

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

const fetchEvents = async (division, divisionName) => {
  const mergedEvents = [];
  for (let club of division.clubs) {
    debug(`fetching event for club ${club.clubId}`);
    const events = await fetchEventsForClub(club, division, divisionName);
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

const fetchEventsFromKeys = async (eventKeys, getAllResults) => {
  const events = [];
  for (const key of eventKeys) {
    const racenetLeaderboardStages = [];
    for (let i = 0; i <= key.lastStageId; i++) {
      if (getAllResults || i === 0 || i === key.lastStageId) {
        let racenetLeaderboard = await fetchEventResults({
          ...key,
          stageId: i
        });
        racenetLeaderboardStages.push(racenetLeaderboard);
      }
    }
    events.push({
      ...key,
      racenetLeaderboardStages
    });
  }
  return events;
};

const getLastStageIds = ({ challengeId, championshipId, recentResults }) => {
  const championship = recentResults.championships.find(
    championship => championship.id === championshipId
  );
  // event id becomes challenge id ??
  const event = championship.events.find(
    event => event.challengeId === challengeId
  );
  if (!event) {
    debug(`no event found in recent results for event id ${challengeId}`);
  }
  return {
    eventId: event.id,
    challengeId: event.challengeId,
    lastStageId: event.stages.length - 1
  };
};

const getEventKeysFromRecentResults = ({
  recentResults,
  championships,
  divisionName,
  club
}) => {
  // pull out championships matching championship ids
  const divisionChampionships = championships.filter(championship =>
    club.championshipIds.includes(championship.id)
  );
  const eventKeys = divisionChampionships.reduce((events, championship) => {
    const eventResultKeys = championship.events.reduce(
      (eventResultKeys, event) => {
        if (
          event.eventStatus === eventStatuses.active ||
          event.eventStatus === eventStatuses.finished
        ) {
          const lastStageIds = getLastStageIds({
            challengeId: event.id,
            championshipId: championship.id,
            recentResults
          });
          eventResultKeys.push({
            eventId: event.id,
            location: event.locationName,
            divisionName: divisionName,
            eventStatus: event.eventStatus,
            ...lastStageIds
          });
        }
        return eventResultKeys;
      },
      []
    );
    events.push(...eventResultKeys);
    return events;
  }, []);
  return eventKeys;
};

const getEventEndTime = championships => {
  const latest = championships[championships.length - 1];
  if (latest.isActive) {
    leagueRef.endTime = latest.events[0].entryWindow.end;
    leagueRef.activeCountry = latest.events[0].locationName;
  }
};

module.exports = {
  fetchEvents,
  // tests
  getEventKeysFromRecentResults,
  fetchEventsFromKeys,
  recalculateDiffsForEntries,
  appendResultsToPreviousEvent
};
