#!/usr/bin/env node

require("dotenv").config();

const { uploadRedirectHTML } = require("./src/api/aws/s3");
const debug = require("debug")("tkidman:rally-round:set-redirect");

const clubName = process.argv[2];

if (!clubName) {
  console.error("Error: club name required");
  console.log(`
Usage: node setRedirectFromConfig.js <clubName>

Examples:
  node setRedirectFromConfig.js oor
  node setRedirectFromConfig.js jrc-themed
  node setRedirectFromConfig.js jrc-rbr

This script reads the websiteName and first entry in historicalSeasonLinks 
from the club's initialState and sets the routing rule accordingly.
`);
  process.exit(1);
}

if (
  !process.env.DIRT_AWS_ACCESS_KEY ||
  !process.env.DIRT_AWS_SECRET_ACCESS_KEY
) {
  console.error("Error: AWS credentials not found.");
  console.error(
    "Please set DIRT_AWS_ACCESS_KEY and DIRT_AWS_SECRET_ACCESS_KEY environment variables."
  );
  process.exit(1);
}

const run = async () => {
  try {
    // Load the club's initial state
    const initialState = require(`./src/state/${clubName}/initialState.js`);

    // Get bucket name from websiteName
    const bucket = initialState.websiteName;
    if (!bucket) {
      console.error(
        `Error: No websiteName found in ${clubName}/initialState.js`
      );
      process.exit(1);
    }

    if (
      !initialState.historicalSeasonLinks ||
      initialState.historicalSeasonLinks.length === 0
    ) {
      console.error(
        `Error: No historicalSeasonLinks found in ${clubName}/initialState.js`
      );
      process.exit(1);
    }

    // Get the first historical season link
    const firstLink = initialState.historicalSeasonLinks[0];
    if (!firstLink.href) {
      console.error(`Error: First historicalSeasonLinks entry has no href`);
      process.exit(1);
    }

    // Extract target folder from href (remove leading /)
    const targetFolder = firstLink.href.replace(/^\//, "");

    // Determine path prefix based on subfolderName
    const pathPrefix = initialState.subfolderName || "";

    console.log(`Club: ${clubName}`);
    console.log(`Bucket: ${bucket}`);
    if (pathPrefix) {
      console.log(`Subfolder: ${pathPrefix}/`);
    }
    console.log(`Championship: ${firstLink.name}`);
    console.log(`Target: ${targetFolder}`);

    const redirectPath = pathPrefix ? `${pathPrefix}/` : "";
    console.log(`\nUploading redirect HTML to ${redirectPath || "root"}...`);

    await uploadRedirectHTML(bucket, targetFolder, firstLink.name, pathPrefix);

    console.log(`✓ Redirect HTML uploaded successfully`);
    console.log(`\nYour website will now redirect:`);
    console.log(`  ${bucket}/${redirectPath} → ${bucket}/${targetFolder}/`);
    console.log(
      `\nNote: The redirect uses client-side JavaScript and meta refresh.`
    );
  } catch (error) {
    if (error.code === "MODULE_NOT_FOUND") {
      console.error(`Error: Could not find club '${clubName}'`);
      console.error(`Make sure ./src/state/${clubName}/initialState.js exists`);
    } else {
      console.error("Error:", error.message);
      debug(error);
    }
    process.exit(1);
  }
};

run();
