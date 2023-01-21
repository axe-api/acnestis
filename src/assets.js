const path = require("path");
const fs = require("fs");

const moveAssetsToDistDirectory = (distDirectory) => {
  const assetPath = path.join(
    distDirectory,
    process.env.XBLOG_ASSET_FOLDER,
    process.env.XBLOG_CURRENT_VERSION
  );
  // Setting the target directory
  if (!fs.existsSync(assetPath)) {
    fs.mkdirSync(assetPath, { recursive: true });
  }

  const assetList = [
    "styles.css",
    "highlight.min.js",
    "tokyo-night-dark.min.css",
  ];

  for (const asset of assetList) {
    const currentPath = path.join(
      process.cwd(),
      process.env.XBLOG_ASSET_FOLDER,
      process.env.XBLOG_CURRENT_VERSION,
      asset
    );
    const targetPath = path.join(assetPath, asset);
    fs.copyFileSync(currentPath, targetPath);
  }
};

module.exports = {
  moveAssetsToDistDirectory,
};
