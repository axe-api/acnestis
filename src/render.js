const path = require("path");
const fs = require("fs");
const renderer = require("./renderer");

const createDateDirectories = (distDirectory, files) => {
  files.forEach((file) => {
    const folderName = path.join(
      distDirectory,
      file.head.category,
      file.head.folderPrefix,
      file.head.slug
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
