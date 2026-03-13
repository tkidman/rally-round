const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { difference } = require("lodash");
const { leagueRef } = require("../../state/league");
const debug = require("debug")("tkidman:rally-round:api:github");

/**
 * Get existing logos from GitHub repository tree
 * @param {string} owner - GitHub owner/org
 * @param {string} repo - Repository name
 * @param {string} treeSha - Tree SHA to query
 * @param {string} clubFolder - Club subfolder path
 * @param {string} logoType - Logo type (teams/cars)
 * @param {object} headers - Request headers
 * @returns {Promise<string[]>} Array of existing logo filenames
 */
const getExistingLogos = async (
  owner,
  repo,
  treeSha,
  clubFolder,
  logoType,
  headers
) => {
  try {
    // Get the tree recursively
    const treeResponse = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${treeSha}?recursive=1`,
      { headers }
    );

    // Filter for logo files in the specific path
    const logoPath = logoType
      ? `${clubFolder}/assets/${logoType}/`
      : `${clubFolder}/assets/`;
    const existingLogos = treeResponse.data.tree
      .filter(item => {
        // For root assets, match files directly in assets/ (not in subdirs)
        if (!logoType) {
          const parts = item.path
            .replace(`${clubFolder}/assets/`, "")
            .split("/");
          return parts.length === 1 && item.path.endsWith(".png");
        }
        // For subdirs (teams/cars), match files in that subdir
        return item.path.startsWith(logoPath) && item.path.endsWith(".png");
      })
      .map(item => item.path.replace(logoPath, "")); // Get just the filename

    return existingLogos;
  } catch (error) {
    // If tree doesn't exist or path not found, return empty array
    if (error.response?.status === 404) {
      return [];
    }
    throw error;
  }
};

const runGitHubOperations = async () => {
  debug("GitHub operations starting...");

  // Validate required environment variables
  if (!process.env.CLUB || !process.env.GH_TOKEN) {
    console.error(
      "Error: Environment variables CLUB or GH_TOKEN are not set. Exiting..."
    );
    process.exit(1);
  }

  if (!process.env.GH_OWNER) {
    console.error(
      "Error: Environment variable GH_OWNER is not set. Exiting..."
    );
    process.exit(1);
  }

  const owner = process.env.GH_OWNER; // GitHub repository owner (user or org)
  const repo = leagueRef.league.websiteName; // Repository name (e.g., "jrc-results")
  const clubFolder = leagueRef.league.subfolderName; // Subfolder within repo (e.g., "jrc")

  debug(`Deploying to GitHub: ${owner}/${repo}/${clubFolder}`);

  const websiteDir = path.resolve(
    __dirname,
    "..",
    "..",
    "..",
    "hidden",
    "out",
    process.env.CLUB,
    "website"
  );

  try {
    const headers = {
      Authorization: `Bearer ${process.env.GH_TOKEN}`,
      Accept: "application/vnd.github.v3+json"
    };

    // Check if repository exists
    try {
      await axios.get(`https://api.github.com/repos/${owner}/${repo}`, {
        headers
      });
      debug(`Repository ${owner}/${repo} exists`);
    } catch (error) {
      if (error.response?.status === 404) {
        console.error(
          `Error: Repository ${owner}/${repo} does not exist.\n` +
            `Please create it first at: https://github.com/new\n` +
            `Repository name should be: ${repo}`
        );
        process.exit(1);
      }
      throw error;
    }

    // Get the latest commit and tree SHA for the branch
    const branchData = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/branches/main`,
      { headers }
    );
    const latestCommitSha = branchData.data.commit.sha;
    const latestTreeSha = branchData.data.commit.commit.tree.sha;
    debug(`Latest commit: ${latestCommitSha}`);

    // Helper function to create a blob
    const createBlob = async (content, encoding = "utf-8") => {
      const blobData = await axios.post(
        `https://api.github.com/repos/${owner}/${repo}/git/blobs`,
        {
          content: content,
          encoding: encoding
        },
        { headers }
      );
      return blobData.data.sha;
    };

    // Prepare all files for upload
    const tree = [];

    // 1. HTML files
    debug("Uploading HTML files as blobs...");
    const htmlFiles = fs
      .readdirSync(websiteDir)
      .filter(file => fs.statSync(path.join(websiteDir, file)).isFile())
      .filter(file => file.endsWith(".html"));

    for (const file of htmlFiles) {
      const content = fs.readFileSync(path.join(websiteDir, file), "utf-8");
      const blobSha = await createBlob(content, "utf-8");
      tree.push({
        path: `${clubFolder}/${file}`,
        mode: "100644",
        type: "blob",
        sha: blobSha
      });
    }
    debug(`Uploaded ${htmlFiles.length} HTML files as blobs`);

    // 2. CSS file
    const cssFile = path.resolve(
      __dirname,
      "..",
      "..",
      "..",
      "assets",
      "css",
      "style.css"
    );
    if (fs.existsSync(cssFile)) {
      const content = fs.readFileSync(cssFile, "utf-8");
      const blobSha = await createBlob(content, "utf-8");
      tree.push({
        path: `${clubFolder}/assets/css/style.css`,
        mode: "100644",
        type: "blob",
        sha: blobSha
      });
      debug("Uploaded CSS file as blob");
    }

    // 3. JS file
    const jsFile = path.resolve(
      __dirname,
      "..",
      "..",
      "..",
      "assets",
      "js",
      "app.js"
    );
    if (fs.existsSync(jsFile)) {
      const content = fs.readFileSync(jsFile, "utf-8");
      const blobSha = await createBlob(content, "utf-8");
      tree.push({
        path: `${clubFolder}/assets/js/app.js`,
        mode: "100644",
        type: "blob",
        sha: blobSha
      });
      debug("Uploaded JS file as blob");
    }

    // 4. Logo files (teams and cars) - only upload new ones
    const addLogos = async logoType => {
      const logoDir = path.resolve(
        __dirname,
        "..",
        "..",
        "..",
        "assets",
        logoType
      );
      if (fs.existsSync(logoDir)) {
        // Get existing logos from GitHub
        const existingLogos = await getExistingLogos(
          owner,
          repo,
          latestTreeSha,
          clubFolder,
          logoType,
          headers
        );
        debug(
          `Found ${existingLogos.length} existing ${logoType} logos in GitHub`
        );

        // Get local logos
        const localLogos = fs
          .readdirSync(logoDir)
          .filter(file => file.endsWith(".png"));

        // Find logos that need to be uploaded (missing from GitHub)
        const missingLogos = difference(localLogos, existingLogos);

        // Upload missing logos as blobs
        for (const file of missingLogos) {
          const content = fs.readFileSync(path.join(logoDir, file));
          const blobSha = await createBlob(
            content.toString("base64"),
            "base64"
          );
          tree.push({
            path: `${clubFolder}/assets/${logoType}/${file}`,
            mode: "100644",
            type: "blob",
            sha: blobSha
          });
        }

        debug(
          `Uploaded ${missingLogos.length} new ${logoType} logos as blobs (${localLogos.length} local, ${existingLogos.length} already exist)`
        );
      }
    };

    await addLogos("teams");
    await addLogos("cars");
    await addLogos("country-flags");

    // 5. Club logo (only the one used by this club)
    const clubLogoFilename = leagueRef.league.logo;
    if (clubLogoFilename) {
      const clubLogoPath = path.resolve(
        __dirname,
        "..",
        "..",
        "..",
        "assets",
        clubLogoFilename
      );

      if (fs.existsSync(clubLogoPath)) {
        // Check if logo already exists in GitHub
        const existingRootLogos = await getExistingLogos(
          owner,
          repo,
          latestTreeSha,
          clubFolder,
          "", // Empty string for root assets path
          headers
        );

        const logoExists = existingRootLogos.includes(clubLogoFilename);

        if (!logoExists) {
          const content = fs.readFileSync(clubLogoPath);
          const blobSha = await createBlob(
            content.toString("base64"),
            "base64"
          );
          tree.push({
            path: `${clubFolder}/assets/${clubLogoFilename}`,
            mode: "100644",
            type: "blob",
            sha: blobSha
          });
          debug(`Uploaded club logo: ${clubLogoFilename}`);
        } else {
          debug(`Club logo ${clubLogoFilename} already exists, skipping`);
        }
      } else {
        debug(`Warning: Club logo ${clubLogoFilename} not found locally`);
      }
    }

    debug(`Total files to upload: ${tree.length}`);

    // Create a new tree with the changes
    const treeData = await axios.post(
      `https://api.github.com/repos/${owner}/${repo}/git/trees`,
      {
        base_tree: latestTreeSha,
        tree: tree
      },
      { headers }
    );
    debug(`Created new tree: ${treeData.data.sha}`);

    // Create a new commit with bot identity
    const commitMessage = `Update ${process.env.CLUB} championship results`;
    const botIdentity = {
      name: "github-actions[bot]",
      email: "41898282+github-actions[bot]@users.noreply.github.com"
    };
    const commitData = await axios.post(
      `https://api.github.com/repos/${owner}/${repo}/git/commits`,
      {
        message: commitMessage,
        tree: treeData.data.sha,
        parents: [latestCommitSha],
        author: botIdentity,
        committer: botIdentity
      },
      { headers }
    );
    debug(`Created new commit: ${commitData.data.sha}`);

    // Update the branch reference to the new commit
    await axios.patch(
      `https://api.github.com/repos/${owner}/${repo}/git/refs/heads/main`,
      {
        sha: commitData.data.sha
      },
      { headers }
    );
    debug(`Updated main branch to new commit`);

    debug("GitHub operations completed successfully!");
  } catch (error) {
    console.error(
      "Error during GitHub operations:",
      error.response?.data || error.message
    );
    throw error;
  }
};

module.exports = runGitHubOperations;
