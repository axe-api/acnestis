const path = require("path");
const fs = require("fs");

module.exports = ({ title, description, keywords, author }) => {
  const TEMPLATE = fs.readFileSync(
    path.join(process.cwd(), process.env.XBLOG_TEMPLATE_FOLDER, "_head.html"),
    "utf-8"
  );

  return TEMPLATE.replaceAll("{TITLE}", title)
    .replaceAll("{DESCRIPTION}", description)
    .replaceAll("{KEYWORDS}", keywords)
    .replaceAll("{AUTHOR}", author);
};
