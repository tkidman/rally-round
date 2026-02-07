# Starting a New Championship

This guide explains how to start a new championship season after reverting to the simple approach where all current championship files live in the league's root folder.

## Quick Reference

**Starting a new championship:**
```bash
# 1. Archive current championship (reads historicalSeasonLinks[0] from config)
npm run prepare-championship oor

# 2. Update championship config (IDs, events, etc.)
# Edit src/state/oor/initialState.js

# 3. Generate new championship
node runner.js <credentials> oor
```

**Done!** New championship at root, old one archived.

---

## Overview

- **Championship files** are uploaded to the **root of the S3 bucket** (or `subfolderName` if specified)
- **historicalSeasonLinks** in `initialState.js` is **only for display** - it adds links to archived championships on your website
- **No versioned folders** - new championships simply overwrite the old files

## Workflow

### 1. Archive Previous Championship (Recommended)

To keep the previous championship accessible, use the automated script:

```bash
npm run prepare-championship oor
```

**What it does:**
1. Reads `historicalSeasonLinks[0]` from your config to determine archive folder name
2. Copies HTML files and assets folder from league root/subfolder to the archive folder
3. Deletes `.html` files (except `error.html`) and cache directory from league root/subfolder
4. Leaves `error.html` in place for the new championship to use

**Prerequisites:**
- Set `DIRT_AWS_ACCESS_KEY` and `DIRT_AWS_SECRET_ACCESS_KEY` environment variables
- First entry in `historicalSeasonLinks` should point to where you want to archive

**Example:**
```javascript
// src/state/oor/initialState.js
historicalSeasonLinks: [
  {
    name: "OOR Autumn",
    href: "/oor-3"  // Script will archive current championship to /oor-3/
  }
]
```

Then run:
```bash
npm run prepare-championship oor
```

**Manual Alternative:**
If you prefer to archive manually using AWS Console or CLI:

**Option A: Using AWS Console**
1. Go to your S3 bucket in AWS Console
2. Create a new folder (e.g., `/oor-1/` or `/themed/themed-29/`)
3. Copy all current championship files into that folder
4. Delete `.html` files and `cache/` folder from root/subfolder
5. Note the folder path for step 2

**Option B: Using AWS CLI**
```bash
# Example: Archive root championship to /oor-1/
aws s3 cp s3://oor-results/ s3://oor-results/oor-1/ --recursive
aws s3 rm s3://oor-results/ --recursive --exclude "*" --include "*.html"
aws s3 rm s3://oor-results/cache/ --recursive

# Example: Archive subfolder championship to versioned folder
aws s3 cp s3://jrc-results/themed/ s3://jrc-results/themed/themed-29/ --recursive
aws s3 rm s3://jrc-results/themed/ --recursive --exclude "*" --include "*.html"
aws s3 rm s3://jrc-results/themed/cache/ --recursive
```

### 2. Update Config with Historical Links

Add archived championships to `historicalSeasonLinks` in your club's `initialState.js`:

```javascript
// src/state/oor/initialState.js
historicalSeasonLinks: [
  {
    name: "OOR Autumn",
    href: "/oor-3"  // Most recent archived championship
  },
  {
    name: "OOR Summer",
    href: "/oor-2"  // Older championship
  },
  {
    name: "OOR Winter",
    href: "/oor-1"  // Oldest championship
  }
]
```

**Important**: 
- All entries in `historicalSeasonLinks` will be shown as links on your website
- The array is only used for display - it does NOT affect where files are uploaded
- Put the most recent season first for better UX

### 3. Update Championship Configuration

Update your championship IDs, events, or other settings in `initialState.js`:

```javascript
divisions: {
  winter: {
    divisionName: "winter",
    displayName: "Winter Season 2026",
    wrc: [
      {
        clubId: "1354",
        championshipIds: ["NEW_CHAMPIONSHIP_ID_HERE"],
        includeNextChampionships: true
      }
    ],
    events: [],
    points
  }
}
```

### 4. Generate New Championship Results

Simply run the runner as normal:

```bash
node runner.js <dirt_username> <dirt_password> <club>
```

Or if credentials are in `.env`:

```bash
CLUB=oor node runner.js
```

**What happens:**
- New results are generated locally in `./hidden/out/`
- If AWS credentials are configured, files are automatically uploaded to S3
- Files upload to the **root** (or `subfolderName`) - overwriting old championship files
- Cache from the root/subfolder is used (no old championship cache)
- Historical links appear on your website pointing to the archived championships

### 5. Done!

Your website now shows:
- ✅ **Current championship** at the root URL
- ✅ **Historical links** to archived championships (if configured)
- ✅ **No caching issues** - always uses cache from current location

## Multi-Club Buckets

For multiple clubs sharing one S3 bucket, use `subfolderName`:

```javascript
// src/state/jrc-themed/initialState.js
subfolderName: "themed",  // Files upload to /themed/
websiteName: "jrc-results",
historicalSeasonLinks: [
  { name: "WRC 2006", href: "/themed/themed-29" },
  { name: "Modern Rally", href: "/themed/themed-28" }
]
```

Files will be uploaded to `jrc-results.s3-website.../themed/` and cache will be downloaded from there.

## Troubleshooting

### Old championship still showing

**Cause:** Browser cache or CloudFront cache (if using it)

**Solution:**
1. Hard refresh browser: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
2. If using CloudFront, create an invalidation for `/*`
3. Check S3 directly: `http://your-bucket.s3-website-region.amazonaws.com/`

### Cache files from wrong championship

**Cause:** This shouldn't happen with the new approach since cache is always from root/subfolder

**Solution:**
1. Delete cache folder in S3: `aws s3 rm s3://bucket-name/cache/ --recursive`
2. Run runner again to generate fresh cache

### Historical links not working

**Cause:** Archived files don't exist at the specified path

**Solution:**
1. Check that you archived the championship to the correct folder
2. Verify the `href` in `historicalSeasonLinks` matches the archived folder path
3. Test the direct URL: `http://bucket-name.s3-website.../oor-1/`

## Example: Full Championship Transition

Let's say you're running OOR and want to start the Autumn 2026 championship:

```bash
# 1. Archive current championship to /oor-2/
aws s3 cp s3://oor-results/ s3://oor-results/oor-2/ --recursive --exclude "cache/*"

# 2. Edit src/state/oor/initialState.js
# Add to historicalSeasonLinks: { name: "OOR Summer", href: "/oor-2" }
# Update championship IDs to new Autumn championship

# 3. Generate new results
node runner.js myUsername myPassword oor

# 4. Done! New championship at root, old one at /oor-2/
```

Visitors see:
- Root URL → Autumn 2026 championship (current)
- Historical link → "OOR Summer" points to `/oor-2/`
