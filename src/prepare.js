const fs = require("fs");
const path = require("path");

const clearDistFolder = (distDirectory) => {
  fs.rmSync(distDirectory, { recursive: true, force: true });
};

const createDirectories = (distDirectory) => {
  fs.mkdirSync(path.join(distDirectory, process.env.XBLOG_DIST_POST_FOLDER), {
    recursive: true,
  });
};

module.exports = {
  clearDistFolder,
  createDirectories,
};
