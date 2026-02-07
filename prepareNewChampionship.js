#!/usr/bin/env node

require("dotenv").config();

const {
  listAllObjects,
  copyObject
} = require("./src/api/aws/s3");
const AWS = require("aws-sdk");
const debug = require("debug")("tkidman:rally-round:prepare-championship");

const IAM_USER_KEY = process.env.DIRT_AWS_ACCESS_KEY
  ? process.env.DIRT_AWS_ACCESS_KEY.trim()
  : undefined;
const IAM_USER_SECRET = process.env.DIRT_AWS_SECRET_ACCESS_KEY
  ? process.env.DIRT_AWS_SECRET_ACCESS_KEY.trim()
  : undefined;
const AWS_REGION =
  process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || "ap-southeast-2";

const s3 = new AWS.S3({
  accessKeyId: IAM_USER_KEY,
  secretAccessKey: IAM_USER_SECRET,
  region: AWS_REGION
});

const clubName = process.argv[2];

if (!clubName) {
  console.log(`
Prepare New Championship
========================

This script helps you archive your current championship before starting a new one.

Usage: npm run prepare-championship <clubName>

Example: npm run prepare-championship oor

What it does:
1. Reads historicalSeasonLinks[0] from your config (the archive folder name)
2. Copies HTML files and assets folder from league root/subfolder to the archive folder
3. Deletes .html files (except error.html) and cache directory from league root/subfolder

After running this:
- Your current championship is archived and accessible at its historical link
- The league root/subfolder is cleaned and ready for new championship files
- Run 'node runner.js' to generate the new championship

Prerequisites:
- DIRT_AWS_ACCESS_KEY and DIRT_AWS_SECRET_ACCESS_KEY must be set
- historicalSeasonLinks[0] should point to where you want to archive (e.g., "/oor-3")
`);
  process.exit(1);
}

const deleteObject = async (bucket, key) => {
  const params = {
    Bucket: bucket,
    Key: key
  };

  return new Promise((resolve, reject) => {
    s3.deleteObject(params, (err, data) => {
      if (err) {
        return reject(err);
      }
      return resolve(data);
    });
  });
};

const main = async () => {
  try {
    debug(`Loading config for ${clubName}`);

    // Load the club's initialState
    const initialState = require(`./src/state/${clubName}/initialState.js`);

    // Validate environment
    if (!IAM_USER_KEY || !IAM_USER_SECRET) {
      console.error(`Error: AWS credentials not found`);
      console.error(
        `Set DIRT_AWS_ACCESS_KEY and DIRT_AWS_SECRET_ACCESS_KEY environment variables`
      );
      process.exit(1);
    }

    if (!initialState.websiteName) {
      console.error(`Error: websiteName not found in ${clubName}/initialState.js`);
      process.exit(1);
    }

    if (
      !initialState.historicalSeasonLinks ||
      initialState.historicalSeasonLinks.length < 1
    ) {
      console.error(`Error: Need at least 1 entry in historicalSeasonLinks to archive to`);
      console.error(
        `Found: ${
          initialState.historicalSeasonLinks
            ? initialState.historicalSeasonLinks.length
            : 0
        }`
      );
      process.exit(1);
    }

    const archiveTarget = initialState.historicalSeasonLinks[0];

    if (!archiveTarget.href) {
      console.error(`Error: historicalSeasonLinks[0] must have href`);
      process.exit(1);
    }

    const bucket = initialState.websiteName;
    
    // Determine source and archive locations from href
    const archiveFolder = archiveTarget.href.startsWith("/")
      ? archiveTarget.href.slice(1)
      : archiveTarget.href;
    
    // If archive path has a parent folder (e.g., "oor-4/mars"), 
    // use the parent as source, otherwise use subfolderName or root
    let sourcePrefix = "";
    if (archiveFolder.includes('/')) {
      // Extract parent folder from archive path
      const pathParts = archiveFolder.split('/');
      sourcePrefix = pathParts.slice(0, -1).join('/') + '/';
    } else if (initialState.subfolderName) {
      // Use subfolderName if set and no parent in archive path
      sourcePrefix = `${initialState.subfolderName}/`;
    }
    // Otherwise sourcePrefix stays empty (root)
    
    const archivePrefix = `${archiveFolder}/`;

    console.log(`\n📦 Prepare New Championship for ${clubName}`);
    console.log(`=====================================\n`);
    console.log(`Bucket:           ${bucket}`);
    console.log(`Source location:  ${sourcePrefix || "(root)"}`);
    console.log(`Archive to:       ${archiveFolder}`);
    console.log(`Archive name:     ${archiveTarget.name}\n`);

    // Step 1: Check if archive folder already exists
    console.log(`\n1️⃣  Checking if archive folder exists...`);
    const existingObjects = await listAllObjects(bucket, archivePrefix);
    if (existingObjects.length > 0) {
      console.error(
        `\n❌ Error: Archive folder '${archiveFolder}' already exists with ${existingObjects.length} files`
      );
      console.error(`\nOptions:`);
      console.error(`1. Delete the existing folder from S3`);
      console.error(
        `2. Or use a different folder name in historicalSeasonLinks[0]`
      );
      process.exit(1);
    }
    console.log(`   ✓ Archive folder does not exist, safe to proceed`);

    // Step 2: Get files to archive (HTML files at root level and assets folder only)
    console.log(`\n2️⃣  Getting files to archive...`);
    const allObjects = await listAllObjects(bucket, sourcePrefix);
    
    // Filter to only HTML files at root level and assets folder
    const sourceObjects = allObjects.filter(obj => {
      const relativeKey = sourcePrefix
        ? obj.Key.slice(sourcePrefix.length)
        : obj.Key;
      
      // Include HTML files ONLY at root level (no slashes in path)
      if (relativeKey.endsWith('.html') && !relativeKey.includes('/')) {
        return true;
      }
      
      // Include everything in assets/ folder
      if (relativeKey.startsWith('assets/')) {
        return true;
      }
      
      return false;
    });

    if (sourceObjects.length === 0) {
      console.error(
        `\n❌ Error: No HTML files or assets found at source location '${sourcePrefix || "(root)"}'`
      );
      console.error(`Make sure you have a current championship to archive`);
      process.exit(1);
    }

    const htmlCount = sourceObjects.filter(obj => {
      const relativeKey = sourcePrefix ? obj.Key.slice(sourcePrefix.length) : obj.Key;
      return relativeKey.endsWith('.html') && !relativeKey.includes('/');
    }).length;
    const assetsCount = sourceObjects.filter(obj => {
      const relativeKey = sourcePrefix ? obj.Key.slice(sourcePrefix.length) : obj.Key;
      return relativeKey.startsWith('assets/');
    }).length;
    
    console.log(`   ✓ Found ${htmlCount} HTML files at root level and ${assetsCount} asset files to archive`);

    // Step 3: Copy all files to archive folder (in parallel batches)
    console.log(`\n3️⃣  Copying files to archive folder...`);
    const BATCH_SIZE = 20; // Copy 20 files at a time
    let copyCount = 0;
    
    for (let i = 0; i < sourceObjects.length; i += BATCH_SIZE) {
      const batch = sourceObjects.slice(i, i + BATCH_SIZE);
      
      await Promise.all(
        batch.map(async obj => {
          const sourceKey = obj.Key;
          const relativeKey = sourcePrefix
            ? sourceKey.slice(sourcePrefix.length)
            : sourceKey;
          const destinationKey = `${archivePrefix}${relativeKey}`;
          
          await copyObject(bucket, sourceKey, destinationKey);
          copyCount++;
        })
      );
      
      process.stdout.write(`   Copied ${copyCount}/${sourceObjects.length} files...\r`);
    }
    console.log(`   ✓ Copied ${copyCount} files to '${archiveFolder}'                    `);

    // Step 4: Show files to be deleted and get confirmation
    console.log(`\n4️⃣  Preparing to delete files from source location...`);
    const allSourceObjects = await listAllObjects(bucket, sourcePrefix);
    
    // Get HTML files to delete (except error.html, only at root level)
    const htmlFiles = allSourceObjects.filter(obj => {
      if (!obj.Key.endsWith(".html")) return false;
      
      const relativeKey = sourcePrefix
        ? obj.Key.slice(sourcePrefix.length)
        : obj.Key;
      
      if (relativeKey.includes('/')) return false;
      if (relativeKey === "error.html") return false;
      
      return true;
    });
    
    // Get cache files to delete
    const cachePrefix = `${sourcePrefix}cache/`;
    const cacheObjects = allSourceObjects.filter(obj => obj.Key.startsWith(cachePrefix));
    
    console.log(`\n   Files to be DELETED:`);
    console.log(`   ${"=".repeat(50)}`);
    
    if (htmlFiles.length > 0) {
      console.log(`\n   HTML files (${htmlFiles.length}):`);
      htmlFiles.forEach(obj => {
        console.log(`   - ${obj.Key}`);
      });
    }
    
    if (cacheObjects.length > 0) {
      console.log(`\n   Cache files (${cacheObjects.length}):`);
      if (cacheObjects.length <= 10) {
        cacheObjects.forEach(obj => {
          console.log(`   - ${obj.Key}`);
        });
      } else {
        console.log(`   - ${cachePrefix}* (${cacheObjects.length} files)`);
      }
    }
    
    if (htmlFiles.length === 0 && cacheObjects.length === 0) {
      console.log(`   (No files to delete)`);
    }
    
    console.log(`\n   ${"=".repeat(50)}`);
    console.log(`\n   ⚠️  These files will be PERMANENTLY DELETED from ${sourcePrefix || "(root)"}`);
    
    // Get user confirmation
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const confirmed = await new Promise(resolve => {
      rl.question('\n   Type "yes" to confirm deletion: ', answer => {
        rl.close();
        resolve(answer.toLowerCase().trim() === 'yes');
      });
    });
    
    if (!confirmed) {
      console.log(`\n❌ Deletion cancelled. Files have been copied to archive but source files remain.`);
      process.exit(0);
    }

    // Step 5: Delete .html files from source location (except error.html)
    console.log(`\n5️⃣  Deleting .html files from source location...`);
    let deleteCount = 0;
    for (const obj of htmlFiles) {
      await deleteObject(bucket, obj.Key);
      deleteCount++;
    }
    console.log(`   ✓ Deleted ${deleteCount} .html files from root level (kept error.html)`);

    // Step 6: Delete cache directory from source location
    console.log(`\n6️⃣  Deleting cache directory from source location...`);
    let cacheDeleteCount = 0;
    for (const obj of cacheObjects) {
      await deleteObject(bucket, obj.Key);
      cacheDeleteCount++;
    }
    console.log(`   ✓ Deleted ${cacheDeleteCount} cache files`);

    console.log(`\n✅ Championship archived successfully!\n`);
    console.log(`Archive location: ${archivePrefix}`);
    console.log(`Archive URL:      https://${bucket}.s3-website-${AWS_REGION}.amazonaws.com/${archiveFolder}/\n`);
    console.log(`Next steps:`);
    console.log(`1. Update your championship configuration (IDs, events, etc.)`);
    console.log(`2. Run: node runner.js <credentials> ${clubName}`);
    console.log(`3. Your new championship will be generated at the root/subfolder\n`);
  } catch (error) {
    console.error(`\n❌ Error:`, error.message);
    if (debug.enabled) {
      console.error(error);
    }
    process.exit(1);
  }
};

main();
