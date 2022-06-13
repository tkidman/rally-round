// Load the AWS SDK for Node.js
const AWS = require("aws-sdk");
const fs = require("fs");
const debug = require("debug")("tkidman:dirt2-results:awsAPI");
const { outputPath, cachePath } = require("../../shared");
const { difference } = require("lodash");

const IAM_USER_KEY = process.env.DIRT_AWS_ACCESS_KEY;
const IAM_USER_SECRET = process.env.DIRT_AWS_SECRET_ACCESS_KEY;

const s3bucket = new AWS.S3({
  accessKeyId: IAM_USER_KEY,
  secretAccessKey: IAM_USER_SECRET
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
    return s3bucket.listObjects(params, function(err, data) {
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
    return s3bucket.getObject(params, function(err, data) {
      if (err) {
        return reject(err);
      }
      return resolve({ key: params.Key, data });
    });
  });
};

const uploadHTML = async (directory, bucket, subfolderName) => {
  const files = fs.readdirSync(directory);
  const htmlFiles = files.filter(file => file.endsWith(".html"));
  const promises = htmlFiles.map(file => {
    const key = subfolderName ? `${subfolderName}/${file}` : file;
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

const uploadCache = async ({
  directory,
  bucket,
  subfolderName,
  fileType,
  contentType
}) => {
  const files = fs.readdirSync(directory);
  const cacheFiles = files.filter(file => file.endsWith(fileType));
  const promises = cacheFiles.map(file => {
    const key = subfolderName
      ? `${subfolderName}/cache/${file}`
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

const uploadTeamLogos = async (bucket, subfolderName) => {
  const remoteTeamsFolder = subfolderName
    ? `${subfolderName}/assets/teams`
    : "assets/teams";
  const remoteLogos = await listObjects(bucket, `${remoteTeamsFolder}`);
  const remoteLogoNames = remoteLogos.Contents.map(s3File => {
    const fileSplit = s3File.Key.split("/");
    return fileSplit[fileSplit.length - 1];
  }).filter(fileName => fileName.endsWith(".png"));
  const localLogos = fs
    .readdirSync("./assets/teams")
    .filter(fileName => fileName.endsWith(".png"));
  const missingLogos = difference(localLogos, remoteLogoNames);

  const promises = missingLogos.map(file => {
    const key = subfolderName
      ? `${remoteTeamsFolder}/${file}`
      : `assets/teams/${file}`;
    return uploadToS3({
      file: `./assets/teams/${file}`,
      key,
      bucket,
      contentType: "image/png"
    });
  });
  await Promise.all(promises);
  debug(`uploaded ${promises.length} team logo files to s3`);
};

const upload = async (bucket, subfolderName) => {
  await uploadTeamLogos(bucket, subfolderName);

  await uploadHTML(`./${outputPath}/website`, bucket, subfolderName);
  await uploadCache({
    directory: `./${cachePath}`,
    bucket,
    subfolderName,
    fileType: ".json",
    contentType: "application/json"
  });

  await uploadCache({
    directory: `./${cachePath}`,
    bucket,
    subfolderName,
    fileType: ".csv",
    contentType: "text/csv"
  });
};

const downloadFiles = async (bucket, keys) => {
  const promises = keys.map(key => getObject(bucket, key));
  const files = Promise.all(promises);
  return files;
};

const downloadCache = async (bucket, subfolderName) => {
  debug("downloading cache files from s3");
  const cachePrefix = subfolderName ? `${subfolderName}/cache` : "cache";
  const objects = await listObjects(bucket, cachePrefix);
  const cacheObjects = objects.Contents.filter(s3Object =>
    s3Object.Key.startsWith(cachePrefix)
  );
  const cacheFileKeys = cacheObjects.map(cacheObject => cacheObject.Key);
  const cacheFiles = await downloadFiles(bucket, cacheFileKeys);
  debug(`downloaded ${cacheFiles.length} cache files from s3`);
  return cacheFiles;
};

module.exports = { upload, downloadCache };
