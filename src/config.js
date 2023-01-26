const path = require("path");
const fs = require("fs");
const yaml = require("js-yaml");

const getConfig = () => {
  const file = path.join(process.cwd(), "config.yml");

  if (!fs.existsSync(file)) {
    throw new Error("The config.yml is not found");
  }

  const content = fs.readFileSync(file, "utf-8");
  return yaml.load(content);
};

module.exports = {
  getConfig,
};
