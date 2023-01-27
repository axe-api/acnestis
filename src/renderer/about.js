const path = require("path");
const fs = require("fs");
const showdown = require("showdown");
const head = require("./head");
const header = require("./header");
const { minifyHTML } = require("./shared");

const converter = new showdown.Converter();

module.exports = ({ configuration, distDirectory }) => {
  const aboutPage = path.join(process.cwd(), "about.md");
  if (fs.existsSync(aboutPage) === false) {
    return;
  }

  const content = converter.makeHtml(fs.readFileSync(aboutPage, "utf-8"));
  const template = fs.readFileSync(
    path.join(process.cwd(), process.env.XBLOG_TEMPLATE_FOLDER, "index.html"),
    "utf-8"
  );

  const builded = template
    .replace("{HEAD}", head(configuration))
    .replaceAll("{HEADER}", header(configuration.title))
    .replaceAll("{POSTS}", content);

  const targetDirectory = path.join(distDirectory, "about");
  fs.mkdirSync(targetDirectory);
  fs.writeFileSync(
    path.join(targetDirectory, "index.html"),
    minifyHTML(builded)
  );
};
