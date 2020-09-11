const moment = require("moment");

const { getDuration } = require("./shared");
const { orderEntriesBy } = require("./shared");
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
  return fetchEventsFromKeys(eventKeys, leagueRef.league.getAllResults);
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

// field is stage or total
const recalculateDiffsForStage = (stage, field) => {
  const timeField = `${field}Time`;
  const diffField = `${field}Diff`;
  const sortedEntries = orderEntriesBy(stage.entries, timeField);
  if (sortedEntries.length > 0) {
    const topTime = getDuration(sortedEntries[0][timeField]);
    for (let i = 1; i < sortedEntries.length; i++) {
      const entry = sortedEntries[i];
      const entryTime = getDuration(sortedEntries[i][timeField]);
      const diff = entryTime.subtract(topTime);
      entry[diffField] = moment
        .utc(diff.as("milliseconds"))
        .format("HH:mm:ss:SSS");
    }
  }
};

const recalculateDiffs = event => {
  event.racenetLeaderboardStages.forEach(stage => {
    recalculateDiffsForStage(stage, "total");
    recalculateDiffsForStage(stage, "stage");
  });
};
const fetchEvents = async (division, divisionName) => {
  const mergedEvents = [];
  for (let club of division.clubs) {
    debug(`fetching event for club ${club.clubId}`);
    const events = await fetchEventsForClub(club, division, divisionName);
    if (mergedEvents.length === 0) {
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
  division,
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
          (!division.onlyLoadFinishedEvents &&
            event.eventStatus === eventStatuses.active) ||
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

const getEventEndTime = (championships) => {
  const latest = championships[championships.length - 1];
  if(latest.isActive){
    leagueRef.endTime = latest.events[0].entryWindow.end;
    leagueRef.activeCountry = latest.events[0].locationName
  }
}

module.exports = {
  fetchEvents,
  // tests
  getEventKeysFromRecentResults,
  fetchEventsFromKeys,
  recalculateDiffsForStage
};
