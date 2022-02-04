const debug = require("debug")("tkidman:dirt2-results:fetch:fetchDirt");

const {
  fetchRecentResults,
  fetchChampionships,
  fetchEventResults
} = require("../../api/dirt");
const fs = require("fs");
const { cachePath, eventStatuses } = require("../../shared");
const { leagueRef } = require("../../state/league");

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
      leagueRef.activeCountry = activeEvent.locationName;
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

module.exports = {
  fetchEventsForClub,
  // tests
  getEventKeysFromRecentResults,
  fetchEventsFromKeys
};
