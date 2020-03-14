# Dirt Rally 2.0 results

Does your league do wild crazy things not supported by the basic Dirt Rally 2.0 league implementation, like teams and powerstages? This utility is here to help.

## Setup

1. Install nodejs
1. Clone this repo to a location on your hard drive, or just download the zip and expand (https://github.com/tkidman/dirt2-results -> clone or download).
1. Run `npm install` from your terminal from this directory
1. Create your credentials file (this whole process will hopefully be automated later ...):
    1. Copy creds.example.js to a new file in this directory called creds.js
    1. Edit the file and update the cookie and xsrfh values with values found in chrome dev tools like this:
        1. Open chrome, and navigate to a Dirt Rally 2.0 club page
        1. Right click on the web page and choose 'Inspect'
        1. Click on the 'Network' tab in the panel that has just opened up
        1. Visit a stage's results in the web page
        1. In the network tab on dev tools, click 'Leaderboard' that has appeared somewhere under the 'name' column. This is the API request to the codemasters backend when viewing event results.
        1. In the request headers section of the headers tab, you should see a 'Cookie' field and a 'RaceNet.XSRFH' field. The values of these 2 fields need to be inserted into the creds.js file you created earlier.
        1. This needs to be done any time your dirt 2.0 rally session expires (ie: you need to re-login)
1. Update src/referenceData/events.js with the events that make up your leagues.
    1. Values for 'eventId' and 'challengeId' can be found in dev tools on the 'Leaderboard' API request in the 'Request Payload' section of the headers tab.  See above for how to get to the 'Leaderboard' API request in dev tools. Use the 'challengeId' from the last stage in the event.
        1. Note order is important here! The events should be specified in the order they occurred.
    1. We need to specify these manually because some events could be shakedown events, and we don't want to include those!     
1. Update driver config. This utility needs a list of all drivers and the teams that they are in.
    1. Download the master drivers google sheet as a csv file to this directory and call it 'drivers.csv'

## Execution

1. run `node ./runner.js` from your terminal

Output will be written to `./hidden/out` - you may need to create this directory before running the script.
 
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
* Write driver csv (in progress)
* Write driver standings csv
* Write team standings csv
* Instructions for use on readme
* Use cached leagueResults.json

### stretch goals
* DNF calculator
* Automatically get cookie
* Deploy to heroku
* Automatically update website
