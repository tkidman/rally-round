---
name: add-championship-round
description: Adds a new RBR (Richard Burns Rally) round to a rally championship (RSC, JRC, etc.) by finding the newly created event on rallysimfans.hu and populating the initialState.js file. Use when the user asks to add a new round, new event, or new rally to an RBR-based championship.
---

# Add Championship Round

## Overview

This skill applies to **RBR (Richard Burns Rally)** championships hosted on [rallysimfans.hu](https://rallysimfans.hu). These are distinct from DiRT Rally 2 (dirt) or WRC-based championships which use different APIs.

Championship rounds are defined in `src/state/<league>/initialState.js` under the `rbr` key, as entries in the `rallies` array. Each entry needs: `eventIds`, `endTime`, `locationName`, `locationFlag`, and `numStages`.

## Steps

### 1. Read the current state file

Read `src/state/<league>/initialState.js` to see existing rounds and their event IDs.

### 2. Find the new event on rallysimfans

Fetch the open rally list filtered by league prefix:

```
https://rallysimfans.hu/rbr/rally_online.php?centerbox=rally_list.php&filter_name=<league>
```

e.g. for RSC: `filter_name=rsc`, for JRC: `filter_name=jrc`

Search the result for rally entries (lines containing `rally_list_details.php&rally_id=`) whose name starts with the league prefix. Find the one whose rally_id is **not already** in the state file.

The table row format is:
```
[Rally Name](https://rallysimfans.hu/rbr/rally_online.php?centerbox=rally_list_details.php&rally_id=XXXXX) | S/F | Stages/Legs | [Creator] | Damage | start_dateend_date
```

### 3. Fetch event details

Fetch:
```
https://rallysimfans.hu/rbr/rally_online.php?centerbox=rally_list_details.php&rally_id=<rally_id>
```

Extract:
- **numStages**: count the stage entries listed, or read the `Stages/Legs` column (first number)
- **endTime**: from the `Leg 1` or `Leg 2` row — use the later end date, format as `"YYYY-MM-DD HH:mm"`
- **locationName**: infer from the rally name and stage countries (all stages list their `Country:`)
- **locationFlag**: ISO 3166-1 alpha-2 country code in uppercase (e.g. `FI` for Finland, `KE` for Kenya, `MC` for Monaco)

### 4. Add the new entry to the state file

Append to the `rallies` array in `src/state/<league>/initialState.js`, following the existing format:

```js
{
  eventIds: [<rally_id>],
  endTime: "<YYYY-MM-DD HH:mm>",
  locationName: "<Rally Name>",
  locationFlag: "<XX>",
  numStages: <N>
  // enduranceRoundMultiplier: 2
}
```

## Country flag codes reference

| Location | Flag |
|----------|------|
| Finland | FI |
| Kenya (Safari) | KE |
| Monaco (Monte Carlo) | MC |
| Sweden | SE |
| Wales (GB) | GB |
| Germany | DE |
| France | FR |
| Australia | AU |
| Argentina | AR |
| Portugal | PT |
| Spain | ES |
| Italy | IT |
| New Zealand | NZ |
| Japan | JP |
| Greece | GR |
| Croatia | HR |

## Example (RSC Season 8, Round 4)

Found: `RSC WRC 1979 - Rally of the 1000 Lakes`, rally_id=95918, 8 Finnish stages, ends 2026-03-23 22:00

Added:
```js
{
  eventIds: [95918],
  endTime: "2026-03-23 22:00",
  locationName: "Rally of the 1000 Lakes",
  locationFlag: "FI",
  numStages: 8
}
```
