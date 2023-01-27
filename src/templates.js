const path = require("path");
const fs = require("fs");
const glob = require("glob");

const getTemplates = async () => {
  const src = path.join(process.env.XBLOG_TEMPLATE_FOLDER);
  return new Promise((resolve) => {
    glob(path.join(src, "/**/*.html"), (err, files) => {
      if (err) {
        console.log("Error", err);
      } else {
        resolve(
          files.map((filepath) => {
            return {
              name: path.basename(filepath),
              content: fs.readFileSync(filepath, "utf-8"),
            };
          })
        );
      }
    });
  });
};

module.exports = async () => {
  const TEMPLATES = await getTemplates();
  const POST_TEMPLATE = TEMPLATES.find((i) => i.name === "post.html").content;
  const INDEX_TEMPLATE = TEMPLATES.find((i) => i.name === "index.html").content;
  const HEAD_TEMPLATE = TEMPLATES.find((i) => i.name === "_head.html").content;

  return {
    POST_TEMPLATE,
    INDEX_TEMPLATE,
    HEAD_TEMPLATE,
  };
};
