# Dirt Rally 2.0 results

Does your league do wild crazy things not supported by the basic Dirt Rally 2.0 league implementation, like teams and powerstages? This utility is here to help.

## Setup

1. Install nodejs (https://nodejs.org/en/download/) - if installing on windows, you don't need the extra tools.
1. Clone this repo to a location on your hard drive, or just download the zip to a location in your home folder and expand (https://github.com/tkidman/dirt2-results -> clone or download).
1. Open a terminal / command prompt in this location. Eg, if in windows, open the unzipped directory in explorer, then copy the path at the top of the window, click the start menu, type 'cmd', then type 'cd ' and paste the path you copied earlier.
1. Run `npm install` from your terminal from this directory

## Execution

1. run `node ./runner.js <dirt_username> <dirt_password>` from your terminal

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
* creds from env vars or command args ✓
* DNF counter
* Get drivers from google sheets automatically
* Get challenge id from event
* Championship mode (no need for event ids, just championship)
* Don't cache 'in progress' events
* Write driver powerstage csv 
* Fix the issues with countries (2 character code in flag image lookup for rest of the world and the UK);

### stretch goals
* Deploy to AWS cloudfront
