#!/usr/bin/env node

const { SitemapStream, streamToPromise } = require("sitemap");
const { Readable } = require("stream");
const path = require("path");
const fs = require("fs");
const assets = require("./assets");
const config = require("./config");
const images = require("./images");
const Logger = require("./logger");
const markdown = require("./markdown");
const prepare = require("./prepare");
const render = require("./render");
const setup = require("./setup");
const templates = require("./templates");

process.env.ACNESTIS_ROOT = path.join(__dirname, "..");

const renderIt = async ({
  logger,
  postDirectory,
  distDirectory,
  repositoryDirectory,
}) => {
  const LINKS = [{ url: "/", changefreq: "weekly", priority: 1 }];

  logger.log("Configurating setup");
  const configuration = config.getConfig();

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
    configuration,
  });
  logger.ok();

  logger.log("Image files have been moved");
  images.moveImagesToDistDirectory({
    repositoryDirectory,
    distDirectory,
    imageFiles,
  });
  logger.ok();

  logger.log("Shared assets have been set");
  assets.moveAssetsToDistDirectory(distDirectory);
  logger.ok();

  logger.log("Index page has been created");
  render.createIndexPage({
    LINKS,
    configuration,
    INDEX_TEMPLATE,
    HEAD_TEMPLATE,
    files,
    distDirectory,
  });
  logger.ok();

  logger.log("Creating about page");
  render.createAboutPage({
    configuration,
    INDEX_TEMPLATE,
    HEAD_TEMPLATE,
    files,
    distDirectory,
    LINKS,
  });
  logger.ok();

  logger.log("Creating the sitemap.xml");
  const sitemap = await toSitemap({ configuration, LINKS });
  fs.writeFileSync(path.join(distDirectory, "sitemap.xml"), sitemap);
  logger.ok();
};

const toSitemap = ({ configuration, LINKS }) => {
  const stream = new SitemapStream({ hostname: configuration.hostname });

  // Return a promise that resolves with your XML string
  return streamToPromise(Readable.from(LINKS).pipe(stream)).then((data) =>
    data.toString()
  );
};

const main = async () => {
  const logger = new Logger();

  const distDirectory = path.join(process.cwd(), "dist");

  await renderIt({
    logger,
    postDirectory: path.join(process.cwd(), "_posts"),
    distDirectory,
    repositoryDirectory: process.cwd(),
  });
};

main();
