const path = require("path");
const fs = require("fs");

const moveImagesToDistDirectory = ({
  rootDirectory,
  distDirectory,
  imageFiles,
}) => {
  for (const imageFile of imageFiles) {
    // The current and the new file path
    const currentPath = `${rootDirectory}${imageFile}`;
    const newPath = `${distDirectory}${imageFile}`;

    // Target directory
    const newDirectory = path.dirname(newPath);

    // Setting the target directory
    if (!fs.existsSync(newDirectory)) {
      fs.mkdirSync(newDirectory, { recursive: true });
    }

    // Copying the file
    fs.copyFileSync(currentPath, newPath);
  }
};

module.exports = { moveImagesToDistDirectory };
