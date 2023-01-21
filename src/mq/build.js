const exec = require("child_process").exec;
const path = require("path");
const assets = require("../assets");
const images = require("../images");
const Logger = require("../logger");
const markdown = require("../markdown");
const prepare = require("../prepare");
const render = require("../render");
const setup = require("../setup");
const templates = require("../templates");
const buildService = require("../services/build");
const userService = require("../services/user");
const siteService = require("../services/site");

function os_func() {
  this.execCommand = function (cmd, callback) {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return;
      }

      callback(stdout);
    });
  };
}
const os = new os_func();

const execute = async (command) => {
  return new Promise((resolve, cancel) => {
    os.execCommand(command, (result) => {
      resolve();
    });
  });
};

const renderIt = async ({
  logger,
  postDirectory,
  distDirectory,
  repositoryDirectory,
}) => {
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
    INDEX_TEMPLATE,
    HEAD_TEMPLATE,
    files,
    distDirectory,
  });
  logger.ok();
};

module.exports = async (msg) => {
  const start = new Date();

  const logger = new Logger();

  const message = (msg?.content || "{}").toString();
  const { userUuid, siteUuid, sessionId } = JSON.parse(message);

  logger.log("Preparing the build data");
  const user = await userService.getUserById(userUuid);
  const site = await siteService.getSiteById(siteUuid);
  const buildUuid = await buildService.createNewBuild(siteUuid);
  logger.ok();

  const { repository } = site;
  const repositoryFolder = `build-${buildUuid}`;

  try {
    logger.log("Cloning the repository");
    await execute(
      `cd pipelines && git clone ${repository} ${repositoryFolder}`
    );
    logger.ok();

    // TODO: Detech the repository structure (Jekyll)

    await renderIt({
      logger,
      postDirectory: path.join(
        process.cwd(),
        "pipelines",
        repositoryFolder,
        "_posts"
      ),
      distDirectory: path.join(process.cwd(), "dist", repositoryFolder),
      repositoryDirectory: path.join(
        process.cwd(),
        "pipelines",
        repositoryFolder
      ),
    });

    logger.log("Deleting the repository");
    await execute(`cd pipelines && rm -rf ${repositoryFolder}`);
    logger.ok();

    // Delete the built
    logger.log("Cleaning files");
    await execute(`cd dist && rm -rf ${repositoryFolder}`);
    logger.ok();

    const end = new Date() - start;
    logger.success(`The blog has been generated: ${end}ms`);

    // Updating the build logs
    await buildService.updateBuild(buildUuid, {
      status: "Success",
      build_time: end,
      logs: logger.get().join("\n"),
    });
  } catch (error) {
    // Delete the repository
    await execute(`cd pipelines && rm -rf ${repositoryFolder}`);

    // Delete the built
    await execute(`cd dist && rm -rf ${repositoryFolder}`);

    const end = new Date() - start;
    logger.error(`ERROR: ${error.message} ${end}ms`);

    // Updating the build logs
    await buildService.updateBuild(buildUuid, {
      status: "Fail",
      build_time: end,
      logs: logger.get().join("\n"),
    });
  }
};
