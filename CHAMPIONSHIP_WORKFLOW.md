# Championship Management Workflow

This document explains how to manage multiple championships using versioned folders and client-side redirects.

## Quick Start

**Starting a new championship (with previous championship):**
1. Edit `historicalSeasonLinks` in your config - add new championship at position 0
2. Run: `npm run prepare-championship oor`
3. Generate results: `node runner.js <credentials> oor`

**Starting a new championship (from parent folder):**
1. Edit `historicalSeasonLinks` in your config - add new championship at position 0
2. Run: `npm run prepare-championship:parent oor`
3. Generate results: `node runner.js <credentials> oor`

Done! 🎉 (runner.js automatically uploads to S3)

## Overview

Championships are stored in versioned folders (e.g., `oor-1/`, `oor-2/`). A redirect HTML file at the bucket root automatically sends visitors to the current championship.

**Benefits:**
- Old championships remain accessible via direct URLs
- Assets automatically copied from previous championship
- Single command to prepare new championship
- Easy to switch between championships

## Prerequisites

Set these environment variables (or add to `.env` file):
```bash
DIRT_AWS_ACCESS_KEY=your_access_key
DIRT_AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=ap-southeast-2  # Optional, defaults to ap-southeast-2
```

Note: The bucket name comes from `websiteName` in your club's `initialState.js`

## Commands

### Prepare New Championship (Recommended)
The easiest way to start a new championship:
```bash
npm run prepare-championship oor
```
This command:
1. Creates new championship folder (from `historicalSeasonLinks[0]`)
2. Copies assets and error.html from previous championship (from `historicalSeasonLinks[1]`)
3. Sets up redirect HTML

**Perfect for:** Starting a new championship when you have a previous championship to copy from.

### Prepare Championship from Parent Folder
Alternative approach that copies from parent/root instead of previous championship:
```bash
npm run prepare-championship:parent oor
```
This command:
1. Creates new championship folder (from `historicalSeasonLinks[0]`)
2. Copies assets/ and all HTML files from parent folder (root or `subfolderName`)
3. Sets up redirect HTML

**Perfect for:** 
- First championship (no previous championship to copy from)
- When your assets/templates are in the parent folder
- Clubs with `subfolderName` where assets are at the subfolder level

### Set Redirect Only
Just update the redirect without copying files:
```bash
npm run set-redirect oor
```
Uploads a redirect HTML file to the bucket root that redirects to the championship folder using JavaScript and meta refresh.

**Use when:** You only need to change which championship the root redirects to.


## Typical Workflows

### First Championship

1. Add the championship to your config's `historicalSeasonLinks`:
   ```javascript
   // src/state/oor/initialState.js
   historicalSeasonLinks: [
     {
       name: "OOR Winter",
       href: "/oor-1"
     }
   ]
   ```

2. Prepare the championship from parent folder (copies assets/HTML from root):
   ```bash
   npm run prepare-championship:parent oor
   ```
   
   This copies from the bucket root (or `subfolderName` if set) into `oor-1/`.

3. Generate and upload results:
   ```bash
   node runner.js <credentials> oor
   ```

Your website root now redirects to `oor-1/`.

### New Championship Starts (Recommended Workflow)

1. Update your config with the new championship at position 0:
   ```javascript
   // src/state/oor/initialState.js
   historicalSeasonLinks: [
     {
       name: "OOR Summer",
       href: "/oor-2"  // New championship at position 0
     },
     {
       name: "OOR Winter",
       href: "/oor-1"  // Previous championship at position 1
     }
   ]
   ```

2. **Run the prepare command** (does everything automatically):
   ```bash
   npm run prepare-championship oor
   ```
   
   This single command:
   - Creates the `oor-2/` folder
   - Copies `assets/` from `oor-1/` to `oor-2/`
   - Copies `error.html` from `oor-1/` to `oor-2/`
   - Sets up the redirect HTML at root

3. Generate and upload your championship results:
   ```bash
   node runner.js <credentials> oor
   ```
   
   Runner.js automatically uploads to S3 (to the folder specified in your config)

Done! Your website root now redirects to `oor-2/`, but `oor-1/` is still accessible at:
`http://oor-results.s3-website-ap-southeast-2.amazonaws.com/oor-1/`

### Multiple Clubs/Championships

The client-side redirect approach works for:
- **Root-level championships:** Redirect at bucket root (e.g., `/index.html` → `/oor-1/`)
- **Subfolder championships:** Redirect at subfolder (e.g., `/themed/index.html` → `/themed/themed-5/`)

**Example with subfolders:**
```javascript
// src/state/jrc-themed/initialState.js
subfolderName: "themed",
historicalSeasonLinks: [
  { name: "Themed Season 5", href: "/themed/themed-5" },
  { name: "Themed Season 4", href: "/themed/themed-4" }
]
```

Then run:
```bash
npm run prepare-championship jrc-themed
```

This uploads the redirect to `themed/index.html`, so:
- `http://bucket/themed/` → redirects to `/themed/themed-5/`
- `http://bucket/themed/themed-4/` → still accessible

### Cleanup Old Championships

When you no longer need old championships, delete them:

```bash
npm run archive delete oor-1
```

## How Client-Side Redirects Work

The script uploads a simple `index.html` file to the bucket root that uses JavaScript and meta refresh to redirect visitors:

```html
<meta http-equiv="refresh" content="0; url=/oor-1/">
<script>
  window.location.href = '/oor-1/';
</script>
```

When someone visits your website root:
1. They load the redirect HTML file
2. JavaScript immediately redirects them to the current championship folder
3. Fallback meta refresh handles cases where JavaScript is disabled
4. A "Click here" link provides manual fallback

**Benefits:**
- No infinite redirect loops
- Instant redirect via JavaScript
- Graceful fallback if JavaScript is disabled
- Simple to update (just re-run the command)

## Important Notes

1. **Works for both root and subfolder championships**. The redirect HTML is uploaded to the appropriate location based on your `subfolderName` setting.

2. **The redirect is instant for most users** thanks to JavaScript, with a meta refresh fallback for browsers with JavaScript disabled.

3. **SEO considerations**: Client-side redirects work fine for internal tools and sports league results. Search engines will follow them, though HTTP redirects are technically better for SEO.

4. **Historical championships remain accessible** via their direct URLs (e.g., `http://oor-results.../oor-1/`, `http://oor-results.../oor-2/`).

5. **Updating is simple**: Just run `npm run set-redirect <clubName>` again to update the redirect target. It overwrites the root `index.html`.

## Troubleshooting

### Redirect not working
1. Check that the `index.html` file exists at the bucket root using the AWS Console
2. Verify it redirects to the correct championship folder
3. Clear your browser cache and try again

### Need to update the redirect
Just run the command again - it will overwrite the redirect HTML:
```bash
npm run set-redirect oor
```

### Check where the redirect points
Download and view the root `index.html` from your S3 bucket to see the target.

