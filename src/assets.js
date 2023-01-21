const path = require("path");
const fs = require("fs");
const { minifyCSS } = require("./renderer/shared");

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
    const content = fs.readFileSync(currentPath, "utf-8");

    if (targetPath.includes(".css") && !targetPath.includes(".min.css")) {
      fs.writeFileSync(targetPath, minifyCSS(content).styles);
    } else {
      fs.writeFileSync(targetPath, content);
    }
  }
};

module.exports = {
  moveAssetsToDistDirectory,
};
