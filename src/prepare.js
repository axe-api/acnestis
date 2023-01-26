const fs = require("fs");
const path = require("path");

const clearDistFolder = (distDirectory) => {
  fs.rmSync(distDirectory, { recursive: true, force: true });
};

const createDirectories = (distDirectory) => {
  fs.mkdirSync(distDirectory, {
    recursive: true,
  });
};

module.exports = {
  clearDistFolder,
  createDirectories,
};
