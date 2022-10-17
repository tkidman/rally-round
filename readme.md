# Rally Round

* Scores results across virtual rally events into championships
* Can pull results from Dirt Rally 2.0 APIs, RichardBurnsRally hu plugin events, and manually entered results via Google Sheets
* Supports teams and tiers / divisions
* Configurable points and powerstage points
* Writes output as html & csv, and integrates with AWS S3 to publish the html.
* Output looks like this: http://jrc-results.s3-website-ap-southeast-2.amazonaws.com/index.html

## Setup

1. Install nodejs (https://nodejs.org/en/download/) - if installing on windows, you don't need the extra tools.
2. Clone this repo to a location on your hard drive, or just download the zip to a location in your home folder and expand (https://github.com/tkidman/dirt2-results -> clone or download).
3. Open a terminal / command prompt in this location. Eg: if in windows, open the unzipped directory in explorer, then copy the path at the top of the window, click the start menu, type 'cmd', then type 'cd ' and paste the path you copied earlier.
4. Run `npm install` from your terminal from this directory
5. Test everything is working by running `npm test` - this will generate a sample site in `./hidden/out/test-e2e/website`

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
* In progress standings ✓
* Link to results from standings ✓
* Overall results from standings ✓
* Fix emojis in driver names in HTML ✓
* Deploy website via code ✓
* Github action to build & deploy website on a schedule ✓
* Multiple classes per division ✓
* Move manual result config to initialState.js ✓ 
* split output.js up into smaller files ✓
* Write and read cache from S3 ✓
* Flag so points aren't calculated for in progress events ✓
* Show division in overall driver standings ✓
* Fix weird movements calculations when points are the same ✓
* Recalculate diffs in overall and show in overall results ✓
* Relegation zone colours ✓
* Show car used by missing drivers ✓
* Show car used in driver results for multi class championships ✓
* Toggle for live / actual points
* enable cloudfront
* Better logging for manual events parsing
* Better logging generally
* knapsack problem for drop rounds ✓
* double points for endurance rounds ✓
* double points for non superrally ✓
* Team as text only ✓

RBR support
* vehicle config (maybe just text for a while)
* pull event data from website, only require event id to configure.

