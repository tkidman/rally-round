#!/usr/bin/env node

require("dotenv").config();

const {
  listAllObjects,
  copyObject,
  uploadRedirectHTML
} = require("./src/api/aws/s3");
const debug = require("debug")(
  "tkidman:rally-round:prepare-championship-from-parent"
);

const clubName = process.argv[2];

if (!clubName) {
  console.error("Error: club name required");
  console.log(`
Usage: node prepareChampionshipFromParent.js <clubName>

Examples:
  node prepareChampionshipFromParent.js oor
  node prepareChampionshipFromParent.js jrc-themed

This script:
1. Reads historicalSeasonLinks from your config
2. Creates a new championship folder (historicalSeasonLinks[0])
3. Copies assets/ and all HTML files from parent folder
4. Sets up redirect HTML

This is useful when you want to copy from the parent/root folder
instead of from a previous championship folder.
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
      initialState.historicalSeasonLinks.length < 1
    ) {
      console.error(`Error: Need at least 1 entry in historicalSeasonLinks`);
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

    if (!currentChampionship.href) {
      console.error(`Error: Championship entry must have href`);
      process.exit(1);
    }

    // Remove leading slash from href
    const newFolder = currentChampionship.href.replace(/^\//, "");

    const pathPrefix = initialState.subfolderName || "";
    const parentFolder = pathPrefix || "";

    console.log(`Club: ${clubName}`);
    console.log(`Bucket: ${bucket}`);
    if (pathPrefix) {
      console.log(`Parent folder: ${pathPrefix}/`);
    } else {
      console.log(`Parent folder: (root)`);
    }
    console.log(
      `New championship: ${currentChampionship.name} (${newFolder}/)`
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

    // Step 1: Copy assets folder from parent to new championship
    // First try parent folder assets, fall back to root assets if not found
    console.log(
      `1️⃣  Copying assets/ from ${parentFolder || "root"}/ to ${newFolder}/...`
    );
    let assetsPrefix = parentFolder ? `${parentFolder}/assets/` : "assets/";
    let assetsObjects = await listAllObjects(bucket, assetsPrefix);
    
    // If no assets in parent folder, try root assets/
    if (assetsObjects.length === 0 && parentFolder) {
      console.log(`   ℹ️  No assets in ${assetsPrefix}, trying root assets/`);
      assetsPrefix = "assets/";
      assetsObjects = await listAllObjects(bucket, assetsPrefix);
    }

    if (assetsObjects.length === 0) {
      console.log(
        `   ⚠️  No assets found in ${assetsPrefix} - skipping assets copy`
      );
    } else {
      const assetsCopyPromises = assetsObjects.map(obj => {
        const sourceKey = obj.Key;
        // Get the relative path from the parent folder
        const relativePath = parentFolder
          ? sourceKey.replace(`${parentFolder}/`, "")
          : sourceKey;
        const destinationKey = `${newFolder}/${relativePath}`;
        return copyObject(bucket, sourceKey, destinationKey);
      });

      await Promise.all(assetsCopyPromises);
      console.log(`   ✓ Copied ${assetsObjects.length} asset files`);
    }

    // Step 2: Copy all HTML files from parent folder
    console.log(
      `\n2️⃣  Copying HTML files from ${parentFolder ||
        "root"}/ to ${newFolder}/...`
    );

    // List all objects in the parent folder
    const allParentObjects = await listAllObjects(bucket, parentFolder);

    // Filter for HTML files in the root of parent folder (not in subfolders)
    const htmlFiles = allParentObjects.filter(obj => {
      const key = obj.Key;
      // Remove parent prefix to check if it's in the root
      const relativePath = parentFolder
        ? key.replace(`${parentFolder}/`, "")
        : key;
      // Check if it's an HTML file and in the root (no additional slashes)
      return relativePath.endsWith(".html") && !relativePath.includes("/");
    });

    if (htmlFiles.length === 0) {
      console.log(
        `   ⚠️  No HTML files found in ${parentFolder ||
          "root"}/ - skipping HTML copy`
      );
    } else {
      const htmlCopyPromises = htmlFiles.map(obj => {
        const sourceKey = obj.Key;
        const filename = sourceKey.split("/").pop();
        const destinationKey = `${newFolder}/${filename}`;
        return copyObject(bucket, sourceKey, destinationKey);
      });

      await Promise.all(htmlCopyPromises);
      console.log(`   ✓ Copied ${htmlFiles.length} HTML files`);
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
    console.log(
      `2. Upload results with: node runner.js <credentials> ${clubName}`
    );
    console.log(
      `\nYour website will redirect: ${bucket}/${redirectPath} → ${bucket}/${newFolder}/`
    );
    if (parentFolder) {
      console.log(
        `Parent folder still accessible at: ${bucket}/${parentFolder}/`
      );
    }
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
