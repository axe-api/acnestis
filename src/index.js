const path = require("path");
const assets = require("./assets");
const images = require("./images");
const markdown = require("./markdown");
const prepare = require("./prepare");
const render = require("./render");
const templates = require("./templates");

const main = async ({ rootDirectory, postDirectory, distDirectory }) => {
  const start = new Date();

  prepare.clearDistFolder(distDirectory);
  prepare.createDirectories(distDirectory);

  const { POST_TEMPLATE, INDEX_TEMPLATE, HEAD_TEMPLATE } = await templates();

  const files = await markdown.getMarkdownFiles(postDirectory);

  render.createDateDirectories(distDirectory, files);
  const imageFiles = render.createBlogPosts({
    distDirectory,
    files,
    POST_TEMPLATE,
    HEAD_TEMPLATE,
  });

  images.moveImagesToDistDirectory({
    rootDirectory,
    distDirectory,
    imageFiles,
  });

  assets.moveAssetsToDistDirectory(distDirectory);

  render.createIndexPage({
    INDEX_TEMPLATE,
    HEAD_TEMPLATE,
    files,
    distDirectory,
  });

  const end = new Date() - start;
  console.info("Execution time: %dms", end);
};

main({
  rootDirectory: path.join(process.cwd(), "ozziest.github.io"),
  postDirectory: path.join(process.cwd(), "ozziest.github.io", "_posts"),
  distDirectory: path.join(process.cwd(), "dist"),
});
