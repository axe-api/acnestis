const path = require("path");
const fs = require("fs");
const showdown = require("showdown");
const head = require("./head");
const header = require("./header");
const footer = require("./footer");
const { minifyHTML } = require("./shared");

const converter = new showdown.Converter();

module.exports = ({ configuration, distDirectory, LINKS }) => {
  const aboutPage = path.join(process.cwd(), "about.md");
  if (fs.existsSync(aboutPage) === false) {
    return;
  }

  const content = converter.makeHtml(fs.readFileSync(aboutPage, "utf-8"));
  const template = fs.readFileSync(
    path.join(process.env.XBLOG_TEMPLATE_FOLDER, "index.html"),
    "utf-8"
  );

  LINKS.push({ url: "/about", changefreq: "yearly", priority: 0.8 });

  const builded = template
    .replace("{HEAD}", head({ configuration }))
    .replaceAll("{HEADER}", header({ configuration }))
    .replaceAll("{POSTS}", content)
    .replaceAll("{FOOTER}", footer({ configuration }));

  const targetDirectory = path.join(distDirectory, "about");
  fs.mkdirSync(targetDirectory);
  fs.writeFileSync(
    path.join(targetDirectory, "index.html"),
    minifyHTML(builded)
  );
};
