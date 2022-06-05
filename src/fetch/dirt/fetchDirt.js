const debug = require("debug")("tkidman:dirt2-results:fetch:fetchDirt");

const {
  fetchRecentResults,
  fetchChampionships,
  fetchEventResults
} = require("../../api/dirt");
const fs = require("fs");
const {
  cachePath,
  eventStatuses,
  getSummedTotalTime,
  recalculateDiffs
} = require("../../shared");
const { leagueRef } = require("../../state/league");
const locations = require("../../state/constants/locations.json");

const fetchEventsForClub = async ({
  club,
  division,
  divisionName,
  getAllResults
}) => {
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
  const events = await fetchEventsFromKeys(eventKeys, getAllResults);

  if (club.cachedEvent) {
    const leaderboardStages = [];
    club.cachedEvent.files.forEach(fileName => {
      const leaderboard = JSON.parse(
        fs.readFileSync(`${cachePath}/${fileName}`, "utf8")
      );
      leaderboardStages.push(leaderboard);
    });
    const cachedEvent = {
      eventId: club.cachedEvent.eventId,
      divisionName,
      location: club.cachedEvent.location,
      eventStatus: eventStatuses.finished,
      leaderboardStages
    };
    events.splice(club.cachedEvent.index, 0, cachedEvent);
  }
  return events;
};

const getEventEndTime = championships => {
  const activeChampionship = championships.find(
    championship => championship.isActive
  );
  if (activeChampionship) {
    const activeEvent = activeChampionship.events.find(
      event => event.eventStatus === eventStatuses.active
    );
    if (activeEvent) {
      leagueRef.endTime = activeEvent.entryWindow.end;
      leagueRef.activeCountryCode =
        locations[activeEvent.locationName].countryCode;
    }
  }
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

  if (club.includeNextChampionships) {
    const matchingChampionshipIndex = championships.findIndex(
      championship =>
        championship.id ===
        club.championshipIds[club.championshipIds.length - 1]
    );
    const nextChampionships = championships.slice(
      matchingChampionshipIndex + 1
    );
    divisionChampionships.push(...nextChampionships);
  }

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
            ...lastStageIds,
            racenetChampionship: championship
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

const fetchEventsFromKeys = async (eventKeys, getAllResults) => {
  const events = [];
  for (const key of eventKeys) {
    const leaderboardStages = [];
    for (let i = 0; i <= key.lastStageId; i++) {
      if (getAllResults || i === 0 || i === key.lastStageId) {
        let racenetLeaderboard = await fetchEventResults({
          ...key,
          stageId: i
        });
        leaderboardStages.push(racenetLeaderboard);
      }
    }
    events.push({
      ...key,
      leaderboardStages
    });
  }
  return events;
};

const mergeEvent = (mergedEvent, event) => {
  if (mergedEvent.location !== event.location) {
    throw new Error("multiclass championship but events do not line up.");
  }
  for (let i = 0; i < event.leaderboardStages.length; i++) {
    mergedEvent.leaderboardStages[i].entries.push(
      ...event.leaderboardStages[i].entries
    );
  }
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
    event.leaderboardStages[event.leaderboardStages.length - 1];
  const eventToAppend = eventToAppendArray[0];
  eventToAppend.leaderboardStages.forEach(stage => {
    const adjustedStage = adjustAppendStageTimes(stage, lastStageBeforeAppend);
    event.leaderboardStages.push(adjustedStage);
  });
};

const fetchDirt2Events = async (division, divisionName, getAllResults) => {
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
      recalculateEventDiffs(event);
    });
  }
  return mergedEvents;
};

module.exports = {
  fetchDirt2Events,
  // tests
  getEventKeysFromRecentResults,
  fetchEventsFromKeys,
  appendResultsToPreviousEvent,
  recalculateEventDiffs
};
