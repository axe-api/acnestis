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

  logger.log("Configurating setup");
  setup();
  logger.ok();

  logger.log("Preparing directories");
  prepare.clearDistFolder(distDirectory);
  prepare.createDirectories(distDirectory);
  logger.ok();

  logger.log("Loading templates");
  const { POST_TEMPLATE, INDEX_TEMPLATE, HEAD_TEMPLATE } = await templates();
  logger.ok();

  logger.log("Blog post files have been read");
  const files = await markdown.getMarkdownFiles(postDirectory);
  logger.ok();

  logger.log("Blog directories have been created");
  render.createDateDirectories(distDirectory, files);
  logger.ok();

  logger.log("Blog posts have been rendered");
  const imageFiles = render.createBlogPosts({
    distDirectory,
    files,
    POST_TEMPLATE,
    HEAD_TEMPLATE,
  });
  logger.ok();

  logger.log("Image files have been moved");
  images.moveImagesToDistDirectory({
    rootDirectory,
    distDirectory,
    imageFiles,
  });
  logger.ok();

  logger.log("Shared assets have been set");
  assets.moveAssetsToDistDirectory(distDirectory);
  logger.ok();

  logger.log("Index page has been created");
  render.createIndexPage({
    INDEX_TEMPLATE,
    HEAD_TEMPLATE,
    files,
    distDirectory,
  });
  logger.ok();

  const end = new Date() - start;
  logger.success(`The blog has been generated: ${end}ms`);

  return logger.get();
};

main({
  rootDirectory: path.join(process.cwd(), "ozziest.github.io"),
  postDirectory: path.join(process.cwd(), "ozziest.github.io", "_posts"),
  distDirectory: path.join(process.cwd(), "dist"),
});
