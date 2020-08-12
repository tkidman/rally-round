# Dirt Rally 2.0 results

Does your league do wild crazy things not supported by the basic Dirt Rally 2.0 league implementation, like teams and powerstages? This utility is here to help.

## Setup

1. Install nodejs (https://nodejs.org/en/download/) - if installing on windows, you don't need the extra tools.
1. Clone this repo to a location on your hard drive, or just download the zip to a location in your home folder and expand (https://github.com/tkidman/dirt2-results -> clone or download).
1. Open a terminal / command prompt in this location. Eg: if in windows, open the unzipped directory in explorer, then copy the path at the top of the window, click the start menu, type 'cmd', then type 'cd ' and paste the path you copied earlier.
1. Run `npm install` from your terminal from this directory

## Execution

1. run `node runner.js <dirt_username> <dirt_password> <club>` from your terminal

Where `<club>` is a folder name in `./src/state` eg: `brl`, `jrc-themed`, `jrc`, `test`  
Output will be written to `./hidden/out`
Cache files will be written to `./hidden/cache`

## Cache

The tool keeps a file based cache of the API responses to speed things up on subsequent executions.  If you want to get fresh data, delete the 
cache files you don't want from `./hidden/cache`

## Club configuration

Clubs are configured in `./src/state/<club_name>/initialState.js`. Here you can define points per class, and the championship ids to fetch results from. 
To get team functionality working you need to download your club's registration sheet as a csv and add it to the club folder and name it `drivers.csv`.

You can also pull driver information directly from a google sheet. You need to have a google sheets API key for this specified in the GOOGLE_SHEETS_API_KEY env var. Sheet configuration is specified in the club's driverConfig.js file.
 
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
* support second club ✓
* support points for DNF ✓
* Championship mode (no need for event ids, just championship) ✓
* Show PS in standings ✓
* Don't log missing driver message when creating team standings ✓ 
* Don't show racenet in Team standings ✓
* Output to a club folder ✓
* Get drivers from google sheets automatically ✓
* Don't cache 'in progress' events ✓
* Don't load pending events ✓
* Output themed to HTML ✓
* Migrate club scraper to here ✓
* Output to sheets ✓
* In progress standings
* Define required car per event
* Github action to build & deploy website on a schedule
* Support multiple driver cars (to support division promotions mid season)
* Multiple classes per division
* DNF counter

### stretch goals
* Deploy to AWS cloudfront
