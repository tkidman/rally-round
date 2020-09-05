// Load the AWS SDK for Node.js
const AWS = require("aws-sdk");
const fs = require("fs");
const debug = require("debug")("tkidman:dirt2-results:awsAPI");

const IAM_USER_KEY = process.env.DIRT_AWS_ACCESS_KEY;
const IAM_USER_SECRET = process.env.DIRT_AWS_SECRET_ACCESS_KEY;

const s3bucket = new AWS.S3({
  accessKeyId: IAM_USER_KEY,
  secretAccessKey: IAM_USER_SECRET
});

const uploadToS3 = (fileName, directory, bucket) => {
  const readStream = fs.createReadStream(`${directory}/${fileName}`);

  const params = {
    Bucket: bucket,
    Key: fileName,
    Body: readStream,
    ContentType: "text/html"
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

const uploadFiles = async (directory, bucket) => {
  const files = fs.readdirSync(directory);
  const htmlFiles = files.filter(file => file.endsWith(".html"));
  const promises = htmlFiles.map(file => {
    return uploadToS3(file, directory, bucket);
  });
  await Promise.all(promises);
  debug(`uploaded ${htmlFiles.length} files to s3`);
};

module.exports = { uploadFiles };
