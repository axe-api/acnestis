const glob = require("glob");
const path = require("path");
const fs = require("fs");
const chalk = require("chalk");
const { PutObjectCommand, S3Client } = require("@aws-sdk/client-s3");
const REGION = "eu-central-1";
const BUCKET_NAME = "xblog-dist";

const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  },
  region: REGION,
});

const getAllFiles = async (src) => {
  return new Promise((resolve) => {
    glob(path.join(src, "/**/*"), { nodir: true }, (err, files) => {
      if (err) {
        console.log("Error", err);
      } else {
        resolve(files);
      }
    });
  });
};

const putS3Object = async ({ file, targetName }) => {
  const fileStream = fs.createReadStream(file);
  const data = await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: targetName,
      Body: fileStream,
    })
  );
};

const pushToS3 = async ({ distDirectory, s3Root }) => {
  const files = await getAllFiles(distDirectory);

  for (const file of files) {
    const targetName = path.join(s3Root, file.replaceAll(distDirectory, ""));
    process.stdout.write(chalk.cyan(`...`));
    await putS3Object({ file, targetName });
  }
};

module.exports = {
  pushToS3,
};
