const path = require("path");
const fs = require("fs");
const renderer = require("./renderer");

const createDateDirectories = (distDirectory, files) => {
  files.forEach((file) => {
    const folderName = path.join(
      distDirectory,
      process.env.XBLOG_DIST_POST_FOLDER,
      file.head.folderPrefix
    );
    if (!fs.existsSync(folderName)) {
      fs.mkdirSync(folderName, { recursive: true });
    }
  });
};

module.exports = {
  createDateDirectories,
  createBlogPosts: renderer.post,
  createIndexPage: renderer.home,
};
