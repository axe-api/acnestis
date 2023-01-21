const path = require("path");
const fs = require("fs");

module.exports = (title) => {
  const templatePath = path.join(
    process.cwd(),
    process.env.XBLOG_TEMPLATE_FOLDER,
    "_header.html"
  );
  const template = fs.readFileSync(templatePath, "utf-8");
  return template.replaceAll("{TITLE}", title);
};
