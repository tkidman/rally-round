const { eventStatuses } = require("./shared");
const { fetchEventResults } = require("./dirtAPI");
const { fetchChampionships } = require("./dirtAPI");
const { fetchRecentResults } = require("./dirtAPI");
const debug = require("debug")("tkidman:dirt2-results:fetch");

const fetchEvents = async (division, divisionName) => {
  const events = [];
  const recentResults = await fetchRecentResults(division.clubId);
  const championships = await fetchChampionships(division.clubId);
  const eventKeys = getEventKeysFromRecentResults({
    recentResults,
    championships,
    division,
    divisionName
  });
  for (const key of eventKeys) {
    const racenetLeaderboard = await fetchEventResults(key);
    const firstStageRacenetLeaderboard = await fetchEventResults({
      ...key,
      stageId: 0
    });
    events.push({
      ...key,
      racenetLeaderboard,
      firstStageRacenetLeaderboard
    });
  }
  return events;
};

const getStageIds = ({ challengeId, championshipId, recentResults }) => {
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
    stageId: `${event.stages.length - 1}`
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
          const stageIds = getStageIds({
            challengeId: event.id,
            championshipId: championship.id,
            recentResults
          });
          eventResultKeys.push({
            eventId: event.id,
            location: event.locationName,
            divisionName: divisionName,
            eventStatus: event.eventStatus,
            ...stageIds
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
  getEventKeysFromRecentResults
};
