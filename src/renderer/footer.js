const path = require("path");
const fs = require("fs");

module.exports = ({ configuration }) => {
  const templatePath = path.join(
    process.cwd(),
    process.env.XBLOG_TEMPLATE_FOLDER,
    "_footer.html"
  );
  const template = fs.readFileSync(templatePath, "utf-8");

  return template.replaceAll("{CONTENT}", configuration.footer);
};
