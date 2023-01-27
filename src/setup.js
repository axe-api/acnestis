const path = require("path");

module.exports = () => {
  process.env.XBLOG_CURRENT_VERSION = "v01";
  process.env.XBLOG_ASSET_FOLDER = path.join(
    process.env.ACNESTIS_ROOT,
    "assets"
  );
  process.env.XBLOG_TEMPLATE_FOLDER = path.join(
    process.env.ACNESTIS_ROOT,
    "templates"
  );
};
