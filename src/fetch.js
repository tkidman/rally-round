const { eventStatuses } = require("./shared");
const { fetchEventResults } = require("./dirtAPI");
const { fetchChampionships } = require("./dirtAPI");
const { fetchRecentResults } = require("./dirtAPI");
const { leagueRef } = require("./state/league");
const debug = require("debug")("tkidman:dirt2-results:fetch");

const fetchEvents = async (division, divisionName) => {
  const recentResults = await fetchRecentResults(division.clubId);
  const championships = await fetchChampionships(division.clubId);
  const eventKeys = getEventKeysFromRecentResults({
    recentResults,
    championships,
    division,
    divisionName
  });
  return fetchEventsFromKeys(eventKeys, leagueRef.league.getAllResults);
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

    const previousEvent = events.length > 0 ? events[events.length - 1] : null;

    // multiclass event, merge the results
    if (previousEvent && previousEvent.location === key.location) {
      debug("Two events found with same location, merging results");
      for (let i = 0; i < racenetLeaderboardStages.length; i++) {
        previousEvent.racenetLeaderboardStages[i].entries.push(
          ...racenetLeaderboardStages[i].entries
        );
      }
    } else {
      events.push({
        ...key,
        racenetLeaderboardStages
      });
    }
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
  divisionName
}) => {
  // pull out championships matching championship ids
  const divisionChampionships = championships.filter(championship =>
    division.championshipIds.includes(championship.id)
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

module.exports = {
  fetchEvents,
  // tests
  getEventKeysFromRecentResults,
  fetchEventsFromKeys
};
