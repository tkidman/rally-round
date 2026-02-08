// Load the AWS SDK for Node.js
const AWS = require("aws-sdk");
const fs = require("fs");
const debug = require("debug")("tkidman:rally-round:awsAPI");
const { outputPath, cachePath } = require("../../shared");
const { difference } = require("lodash");

const IAM_USER_KEY = process.env.DIRT_AWS_ACCESS_KEY
  ? process.env.DIRT_AWS_ACCESS_KEY.trim()
  : undefined;
const IAM_USER_SECRET = process.env.DIRT_AWS_SECRET_ACCESS_KEY
  ? process.env.DIRT_AWS_SECRET_ACCESS_KEY.trim()
  : undefined;
const AWS_REGION =
  process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || "ap-southeast-2";

const s3bucket = new AWS.S3({
  accessKeyId: IAM_USER_KEY,
  secretAccessKey: IAM_USER_SECRET,
  region: AWS_REGION
});

const uploadToS3 = ({ file, key, bucket, contentType }) => {
  const readStream = fs.createReadStream(file);

  const params = {
    Bucket: bucket,
    Key: key,
    Body: readStream,
    ContentType: contentType
  };

  return new Promise((resolve, reject) => {
    s3bucket.upload(params, (err, data) => {
      readStream.destroy();

      if (err) {
        return reject(err);
      }

      return resolve(data);
    });
  });
};

const listObjects = async (bucket, prefix) => {
  const params = {
    Bucket: bucket,
    Prefix: prefix
  };

  return new Promise((resolve, reject) => {
    return s3bucket.listObjects(params, function (err, data) {
      if (err) {
        return reject(err);
      }
      return resolve(data);
    });
  });
};

const getObject = async (bucket, key) => {
  const params = {
    Bucket: bucket,
    Key: key
  };

  return new Promise((resolve, reject) => {
    return s3bucket.getObject(params, function (err, data) {
      if (err) {
        return reject(err);
      }
      return resolve({ key: params.Key, data });
    });
  });
};

const uploadHTML = async (directory, bucket, championshipFolder) => {
  const files = fs.readdirSync(directory);
  const htmlFiles = files.filter(file => file.endsWith(".html"));
  const promises = htmlFiles.map(file => {
    const key = championshipFolder ? `${championshipFolder}/${file}` : file;
    return uploadToS3({
      file: `${directory}/${file}`,
      key,
      bucket,
      contentType: "text/html"
    });
  });
  await Promise.all(promises);
  debug(`uploaded ${htmlFiles.length} files to s3`);
};

const uploadCSS = async ({ bucket, championshipFolder }) => {
  const file = "./assets/css/style.css";
  const remoteCSSFolder = championshipFolder
    ? `${championshipFolder}/assets/css`
    : "assets/css";
  const key = `${remoteCSSFolder}/style.css`;
  await uploadToS3({
    file,
    key,
    bucket,
    contentType: "text/css"
  });
  debug(`uploaded style.css to s3`);
};

const uploadJS = async ({ bucket, championshipFolder }) => {
  const file = "./assets/js/app.js";
  const remoteJSFolder = championshipFolder
    ? `${championshipFolder}/assets/js`
    : "assets/js";
  const key = `${remoteJSFolder}/app.js`;
  await uploadToS3({
    file,
    key,
    bucket,
    contentType: "application/javascript"
  });
  debug(`uploaded app.js to s3`);
};

const uploadCache = async ({
  directory,
  bucket,
  championshipFolder,
  fileType,
  contentType
}) => {
  const files = fs.readdirSync(directory);
  const cacheFiles = files.filter(file => file.endsWith(fileType));
  const promises = cacheFiles.map(file => {
    const key = championshipFolder
      ? `${championshipFolder}/cache/${file}`
      : `cache/${file}`;
    return uploadToS3({
      file: `${directory}/${file}`,
      key,
      bucket,
      contentType
    });
  });
  await Promise.all(promises);
  debug(`uploaded ${cacheFiles.length} cache files to s3`);
};

const uploadLogos = async (bucket, championshipFolder, logoDir) => {
  const remoteLogoFolder = championshipFolder
    ? `${championshipFolder}/assets/${logoDir}`
    : `assets/${logoDir}`;
  const remoteLogos = await listObjects(bucket, `${remoteLogoFolder}`);
  const remoteLogoNames = remoteLogos.Contents.map(s3File => {
    const fileSplit = s3File.Key.split("/");
    return fileSplit[fileSplit.length - 1];
  }).filter(fileName => fileName.endsWith(".png"));
  const localLogos = fs
    .readdirSync(`./assets/${logoDir}`)
    .filter(fileName => fileName.endsWith(".png"));
  const missingLogos = difference(localLogos, remoteLogoNames);

  const promises = missingLogos.map(file => {
    const key = championshipFolder
      ? `${remoteLogoFolder}/${file}`
      : `assets/${logoDir}/${file}`;
    return uploadToS3({
      file: `./assets/${logoDir}/${file}`,
      key,
      bucket,
      contentType: "image/png"
    });
  });
  await Promise.all(promises);
  debug(`uploaded ${promises.length} ${logoDir} logo files to s3`);
};

const upload = async (bucket, championshipFolder) => {
  await uploadLogos(bucket, championshipFolder, "teams");
  await uploadLogos(bucket, championshipFolder, "cars");

  await uploadHTML(`./${outputPath}/website`, bucket, championshipFolder);
  await uploadCache({
    directory: `./${cachePath}`,
    bucket,
    championshipFolder,
    fileType: ".json",
    contentType: "application/json"
  });

  await uploadCache({
    directory: `./${cachePath}`,
    bucket,
    championshipFolder,
    fileType: ".csv",
    contentType: "text/csv"
  });

  await uploadCSS({ bucket, championshipFolder });
  await uploadJS({ bucket, championshipFolder });
};

const downloadFiles = async (bucket, keys) => {
  const promises = keys.map(key => getObject(bucket, key));
  const files = Promise.all(promises);
  return files;
};

const downloadCache = async (bucket, championshipFolder) => {
  debug("downloading cache files from s3");
  const cachePrefix = championshipFolder
    ? `${championshipFolder}/cache`
    : "cache";
  const objects = await listObjects(bucket, cachePrefix);
  const cacheObjects = objects.Contents.filter(s3Object =>
    s3Object.Key.startsWith(cachePrefix)
  );
  const cacheFileKeys = cacheObjects.map(cacheObject => cacheObject.Key);
  const cacheFiles = await downloadFiles(bucket, cacheFileKeys);
  debug(`downloaded ${cacheFiles.length} cache files from s3`);
  return cacheFiles;
};

const copyObject = async (bucket, sourceKey, destinationKey) => {
  // CopySource must be URL-encoded
  const encodedSourceKey = encodeURIComponent(sourceKey).replace(/%2F/g, "/");
  const params = {
    Bucket: bucket,
    CopySource: `${bucket}/${encodedSourceKey}`,
    Key: destinationKey
  };

  return new Promise((resolve, reject) => {
    s3bucket.copyObject(params, (err, data) => {
      if (err) {
        return reject(err);
      }
      return resolve(data);
    });
  });
};

const listAllObjects = async (bucket, prefix) => {
  let allObjects = [];
  let continuationToken = null;

  do {
    const params = {
      Bucket: bucket,
      Prefix: prefix
    };

    if (continuationToken) {
      params.ContinuationToken = continuationToken;
    }

    const result = await new Promise((resolve, reject) => {
      s3bucket.listObjectsV2(params, (err, data) => {
        if (err) {
          return reject(err);
        }
        return resolve(data);
      });
    });

    if (result.Contents) {
      allObjects = allObjects.concat(result.Contents);
    }

    continuationToken = result.NextContinuationToken;
  } while (continuationToken);

  return allObjects;
};

const createRedirectHTML = (targetFolder, championshipName) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Redirecting to ${championshipName || "Championship"}...</title>
  <meta http-equiv="refresh" content="0; url=/${targetFolder}/">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    .container {
      text-align: center;
    }
    .spinner {
      border: 4px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border-top: 4px solid white;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 20px auto;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  </style>
  <script>
    // Redirect to current championship
    window.location.href = '/${targetFolder}/';
  </script>
</head>
<body>
  <div class="container">
    <div class="spinner"></div>
    <p>Redirecting to ${championshipName || "championship"}...</p>
    <p><a href="/${targetFolder}/" style="color: white;">Click here if not redirected automatically</a></p>
  </div>
</body>
</html>`;
};

const uploadRedirectHTML = async (
  bucket,
  targetFolder,
  championshipName,
  subfolderName
) => {
  const redirectKey = subfolderName
    ? `${subfolderName}/index.html`
    : "index.html";
  debug(`uploading redirect HTML to ${redirectKey}: -> ${targetFolder}`);

  const htmlContent = createRedirectHTML(targetFolder, championshipName);

  const params = {
    Bucket: bucket,
    Key: redirectKey,
    Body: htmlContent,
    ContentType: "text/html"
  };

  return new Promise((resolve, reject) => {
    s3bucket.upload(params, (err, data) => {
      if (err) {
        return reject(err);
      }
      debug(`redirect HTML uploaded to ${redirectKey}`);
      return resolve(data);
    });
  });
};

module.exports = {
  upload,
  downloadCache,
  listAllObjects,
  uploadRedirectHTML,
  copyObject
};
