const path = require("path");
const fs = require("fs");
const googleAnalyticsRender = require("./googleAnalytics");

module.exports = ({ configuration }) => {
  const TEMPLATE = fs.readFileSync(
    path.join(process.env.XBLOG_TEMPLATE_FOLDER, "_head.html"),
    "utf-8"
  );

  return TEMPLATE.replaceAll("{LANG}", configuration.lang)
    .replaceAll("{TITLE}", configuration.title)
    .replaceAll("{DESCRIPTION}", configuration.description)
    .replaceAll("{KEYWORDS}", configuration.keywords)
    .replaceAll("{AUTHOR}", configuration.author)
    .replaceAll(
      "{GOOGLE_ANALYTICS}",
      configuration.googleAnalytics
        ? googleAnalyticsRender(configuration.googleAnalytics)
        : ""
    );
};
