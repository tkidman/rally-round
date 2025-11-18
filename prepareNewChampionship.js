#!/usr/bin/env node

require("dotenv").config();

const {
  listAllObjects,
  copyObject,
  uploadRedirectHTML
} = require("./src/api/aws/s3");
const debug = require("debug")("tkidman:rally-round:prepare-championship");

const clubName = process.argv[2];

if (!clubName) {
  console.error("Error: club name required");
  console.log(`
Usage: node prepareNewChampionship.js <clubName>

Examples:
  node prepareNewChampionship.js oor
  node prepareNewChampionship.js jrc-themed

This script:
1. Reads historicalSeasonLinks from your config
2. Creates a new championship folder (historicalSeasonLinks[0])
3. Copies assets/ and error.html from previous championship (historicalSeasonLinks[1])
4. Sets up redirect HTML at root

After running this, upload your championship results to the new folder.
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
      initialState.historicalSeasonLinks.length < 2
    ) {
      console.error(
        `Error: Need at least 2 entries in historicalSeasonLinks (current and previous)`
      );
      console.error(
        `Found: ${
          initialState.historicalSeasonLinks
            ? initialState.historicalSeasonLinks.length
            : 0
        }`
      );
      process.exit(1);
    }

    const currentChampionship = initialState.historicalSeasonLinks[0];
    const previousChampionship = initialState.historicalSeasonLinks[1];

    if (!currentChampionship.href || !previousChampionship.href) {
      console.error(`Error: Both championship entries must have href`);
      process.exit(1);
    }

    // Remove leading slash from hrefs
    const newFolder = currentChampionship.href.replace(/^\//, "");
    const oldFolder = previousChampionship.href.replace(/^\//, "");

    const pathPrefix = initialState.subfolderName || "";

    console.log(`Club: ${clubName}`);
    console.log(`Bucket: ${bucket}`);
    if (pathPrefix) {
      console.log(`Subfolder: ${pathPrefix}/`);
    }
    console.log(
      `New championship: ${currentChampionship.name} (${newFolder}/)`
    );
    console.log(
      `Previous championship: ${previousChampionship.name} (${oldFolder}/)`
    );
    console.log("");

    // Check if new folder already exists
    console.log(`🔍 Checking if ${newFolder}/ already exists...`);
    const existingObjects = await listAllObjects(bucket, `${newFolder}/`);
    if (existingObjects.length > 0) {
      console.error(
        `\n❌ Error: Championship folder ${newFolder}/ already exists in S3!`
      );
      console.error(
        `   Found ${existingObjects.length} existing files in this folder.`
      );
      console.error(
        `\nTo avoid overwriting existing data, this script will exit.`
      );
      console.error(`\nIf you want to replace this championship:`);
      console.error(
        `1. Delete the existing folder first (manually or via AWS CLI)`
      );
      console.error(
        `2. Or use a different championship name in historicalSeasonLinks`
      );
      process.exit(1);
    }
    console.log(`   ✓ Folder does not exist, safe to proceed\n`);

    // Step 1: Copy assets folder from old to new
    console.log(`1️⃣  Copying assets/ from ${oldFolder}/ to ${newFolder}/...`);
    const assetsObjects = await listAllObjects(bucket, `${oldFolder}/assets/`);

    if (assetsObjects.length === 0) {
      console.log(
        `   ⚠️  No assets found in ${oldFolder}/assets/ - skipping assets copy`
      );
    } else {
      const assetsCopyPromises = assetsObjects.map(obj => {
        const sourceKey = obj.Key;
        const relativePath = sourceKey.replace(`${oldFolder}/`, "");
        const destinationKey = `${newFolder}/${relativePath}`;
        return copyObject(bucket, sourceKey, destinationKey);
      });

      await Promise.all(assetsCopyPromises);
      console.log(`   ✓ Copied ${assetsObjects.length} asset files`);
    }

    // Step 2: Copy error.html if it exists
    console.log(
      `\n2️⃣  Copying error.html from ${oldFolder}/ to ${newFolder}/...`
    );
    try {
      await copyObject(
        bucket,
        `${oldFolder}/error.html`,
        `${newFolder}/error.html`
      );
      console.log(`   ✓ Copied error.html`);
    } catch (error) {
      if (error.code === "NoSuchKey") {
        console.log(`   ⚠️  No error.html found in ${oldFolder}/ - skipping`);
      } else {
        throw error;
      }
    }

    // Step 3: Set up redirect
    const redirectPath = pathPrefix ? `${pathPrefix}/` : "";
    console.log(
      `\n3️⃣  Setting up redirect HTML at ${redirectPath || "root"}...`
    );
    await uploadRedirectHTML(
      bucket,
      newFolder,
      currentChampionship.name,
      pathPrefix
    );
    console.log(`   ✓ Redirect HTML uploaded`);

    console.log(`\n✨ Championship prepared successfully!`);
    console.log(`\nNext steps:`);
    console.log(
      `1. Run your normal build process to generate championship results`
    );
    console.log(`2. Upload results with: npm run archive upload ${newFolder}`);
    console.log(
      `\nYour website will redirect: ${bucket}/${redirectPath} → ${bucket}/${newFolder}/`
    );
    console.log(
      `Previous championship still accessible at: ${bucket}/${oldFolder}/`
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
