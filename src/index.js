const path = require("path");
const assets = require("./assets");
const images = require("./images");
const Logger = require("./logger");
const markdown = require("./markdown");
const prepare = require("./prepare");
const render = require("./render");
const setup = require("./setup");
const templates = require("./templates");

const main = async ({ rootDirectory, postDirectory, distDirectory }) => {
  const start = new Date();

  const logger = new Logger();

  setup();
  logger.log("Setup has been completed");

  prepare.clearDistFolder(distDirectory);
  prepare.createDirectories(distDirectory);
  logger.log("Directories has been set");

  const { POST_TEMPLATE, INDEX_TEMPLATE, HEAD_TEMPLATE } = await templates();
  logger.log("Templates are loaded");

  const files = await markdown.getMarkdownFiles(postDirectory);
  logger.log("Blog post files have been read");

  render.createDateDirectories(distDirectory, files);
  logger.log("Blog directories have been created");

  const imageFiles = render.createBlogPosts({
    distDirectory,
    files,
    POST_TEMPLATE,
    HEAD_TEMPLATE,
  });
  logger.log("Blog posts have been rendered");

  images.moveImagesToDistDirectory({
    rootDirectory,
    distDirectory,
    imageFiles,
  });
  logger.log("Image files have been moved");

  assets.moveAssetsToDistDirectory(distDirectory);
  logger.log("Shared assets have been set");

  render.createIndexPage({
    INDEX_TEMPLATE,
    HEAD_TEMPLATE,
    files,
    distDirectory,
  });
  logger.log("Index page has been created");

  const end = new Date() - start;
  console.info("Execution time: %dms", end);
};

main({
  rootDirectory: path.join(process.cwd(), "ozziest.github.io"),
  postDirectory: path.join(process.cwd(), "ozziest.github.io", "_posts"),
  distDirectory: path.join(process.cwd(), "dist"),
});
