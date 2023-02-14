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
  recalculateDiffs,
  mergeEvent
} = require("../../shared");
const { leagueRef } = require("../../state/league");
const locations = require("../../state/constants/locations.json");
const { isNil } = require("lodash");

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

const fetchDirt2Events = async (division, divisionName, getAllResults) => {
  const mergedEvents = [];
  for (let club of division.clubs) {
    debug(`fetching event for club ${club.clubId}`);
    if (!isNil(club.appendToEventIndex)) {
      throw new Error(
        "no longer supported - use division.appendEventIndexesToPrevious instead"
      );
    }
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
  if (division.clubs.length > 1 || division.appendEventIndexesToPrevious) {
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
  appendEvents,
  fetchEventsFromKeys,
  recalculateEventDiffs
};
