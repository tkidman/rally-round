# Dirt Rally 2.0 results

Does your league do wild crazy things not supported by the basic Dirt Rally 2.0 league implementation, like teams and powerstages? This utility is here to help.

## Setup

1. Install nodejs (https://nodejs.org/en/download/) - if installing on windows, you don't need the extra tools.
1. Clone this repo to a location on your hard drive, or just download the zip and expand (https://github.com/tkidman/dirt2-results -> clone or download).
1. Extract the zip to a location in your home folder
1. Open a terminal / command prompt in this location. Eg, if in windows, open the unzipped directory in explorer, then copy the path at the top of the window, click the start menu, type 'cmd', then type 'cd ' and paste the path you copied earlier.
1. Run `npm install` from your terminal from this directory
1. Create your credentials file (see below for instructions)
1. Update src/referenceData/events.js with the events that make up your leagues.
    1. Values for 'eventId' and 'challengeId' can be found in dev tools on the 'Leaderboard' API request in the 'Request Payload' section of the headers tab.  See above for how to get to the 'Leaderboard' API request in dev tools. Use the 'challengeId' from the last stage in the event.
        1. Note order is important here! The events should be specified in the order they occurred.
    1. We need to specify these manually because some events could be shakedown events, and we don't want to include those!     
1. Update driver config. This utility needs a list of all drivers and the teams that they are in.
    1. Download the master drivers google sheet as a csv file to this directory and call it 'drivers.csv'

## Credentials file
* needs to be stored in a folder called `dirt2-config` at the same level as this folder, eg:
```
home\stuff\dirt2-results
home\stuff\dirt2-config
```
* needs to be called `creds.json`
* needs the following contents:
```
{
  "username": "your codemasters email",
  "password": "your codemasters password"
}
```

## Execution

1. run `node ./runner.js` from your terminal

Output will be written to `./hidden/out`
Cache files will be written to `./hidden/cache`

## Cache

The tool keeps a file based cache of the API responses to speed things up on subsequent executions.  If you want to get fresh data, delete the 
cache files you don't want from `./hidden/cache`
 
## To Do
* Call dirt 2 Leaderboard API ✓
* Call dirt 2 Championship API ✓
* Drivers ✓
* Teams ✓
* Points ✓
* Calculate driver points ✓
* Get Driver event results ✓
* Get Team event results ✓
* Load drivers from csv ✓
* Wire in leaderboard API call ✓
* Get Driver standings ✓
* Get Team standings ✓
* Get driver config from google sheet ✓
* Get overall event results ✓
* Write driver csv ✓
* Use cached leagueResults.json ✓
* Create a result for all competitors, even if they didn't race ✓
* Write driver standings csv ✓
* Write team standings csv ✓
* Instructions for use on readme ✓
* Automatically get cookie ✓
* DNF counter
* Get drivers from google sheets automatically
* Get challenge id from event
* Championship mode (no need for event ids, just championship)
* Don't cache in progress events
* Write driver powerstage csv 
* Ensure the csvs and be imported into the website
* Fix the issues with countries (2 character code in flag image lookup for rest of the world and the UK);

### stretch goals
* DNF calculator
* Deploy to AWS cloudfront
* Automatically update website
