const path = require("path");
const fs = require("fs");
const googleAnalyticsRender = require("./googleAnalytics");

module.exports = ({
  title,
  description,
  keywords,
  author,
  googleAnalytics,
  lang = "en",
}) => {
  const TEMPLATE = fs.readFileSync(
    path.join(process.env.XBLOG_TEMPLATE_FOLDER, "_head.html"),
    "utf-8"
  );

  return TEMPLATE.replaceAll("{LANG}", lang)
    .replaceAll("{TITLE}", title)
    .replaceAll("{DESCRIPTION}", description)
    .replaceAll("{KEYWORDS}", keywords)
    .replaceAll("{AUTHOR}", author)
    .replaceAll(
      "{GOOGLE_ANALYTICS}",
      googleAnalytics ? googleAnalyticsRender(googleAnalytics) : ""
    );
};
