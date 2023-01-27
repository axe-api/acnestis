const path = require("path");
const fs = require("fs");
const cheerio = require("cheerio");
const { minifyHTML } = require("./shared");
const header = require("./header");
const head = require("./head");
const footer = require("./footer");

const extractImageUrls = (html) => {
  const $ = cheerio.load(html);
  const imageUrls = [];
  $("img").each((i, elem) => {
    imageUrls.push($(elem).attr("src"));
  });
  return imageUrls;
};

module.exports = ({
  configuration,
  distDirectory,
  files,
  POST_TEMPLATE,
  HEAD_TEMPLATE,
}) => {
  const imageFiles = [];

  for (const file of files) {
    const slug = file.head.slug.replaceAll("/", "");
    const fileName = path.join(
      distDirectory,
      file.head.category,
      file.head.folderPrefix,
      slug,
      "index.html"
    );

    const buildContent = POST_TEMPLATE.replaceAll(
      "{HEAD}",
      head({
        title: `${configuration.title} - ${file.head.title}`,
        description: `${configuration.description} ${file.head.title}`,
        keywords: `${configuration.keywords} ${file.head.keywords}`,
        author: file.head?.author ? file.head.author : configuration.author,
      })
    )
      .replaceAll("{HEADER}", header(configuration.title))
      .replaceAll("{BODY}", file.html)
      .replaceAll("{TITLE}", file.head.title)
      .replaceAll("{FOOTER}", footer({ configuration }));
    fs.writeFileSync(fileName, minifyHTML(buildContent));
    imageFiles.push(...extractImageUrls(file.html));
  }

  return imageFiles.filter(
    (path) => !path.includes("https://") && !path.includes("http://")
  );
};
