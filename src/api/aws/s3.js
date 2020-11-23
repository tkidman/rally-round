// Load the AWS SDK for Node.js
const AWS = require("aws-sdk");
const fs = require("fs");
const debug = require("debug")("tkidman:dirt2-results:awsAPI");
const { outputPath, cachePath } = require("../../shared");

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

const uploadCache = async (directory, bucket, subfolderName) => {
  const files = fs.readdirSync(directory);
  const cacheFiles = files.filter(file => file.endsWith(".json"));
  const promises = cacheFiles.map(file => {
    const key = subfolderName
      ? `${subfolderName}/cache/${file}`
      : `cache/${file}`;
    return uploadToS3({
      file: `${directory}/${file}`,
      key,
      bucket,
      contentType: "application/json"
    });
  });
  await Promise.all(promises);
  debug(`uploaded ${cacheFiles.length} cache files to s3`);
};

const upload = async (bucket, subfolderName) => {
  await uploadHTML(`./${outputPath}/website`, bucket, subfolderName);
  await uploadCache(`./${cachePath}`, bucket, subfolderName);
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
