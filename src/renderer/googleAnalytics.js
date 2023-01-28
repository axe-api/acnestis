const path = require("path");
const fs = require("fs");

module.exports = (code) => {
  const TEMPLATE = fs.readFileSync(
    path.join(process.env.XBLOG_TEMPLATE_FOLDER, "_google-analytics.html"),
    "utf-8"
  );

  return TEMPLATE.replaceAll("{CODE}", code);
};
