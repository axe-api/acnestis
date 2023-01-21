const path = require("path");
const fs = require("fs");

const moveAssetsToDistDirectory = (distDirectory) => {
  const assetPath = path.join(distDirectory, "assets");
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
    const currentPath = path.join(process.cwd(), "assets", asset);
    const targetPath = path.join(assetPath, asset);
    fs.copyFileSync(currentPath, targetPath);
  }
};

module.exports = {
  moveAssetsToDistDirectory,
};
