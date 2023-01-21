const path = require("path");
const fs = require("fs");
const cheerio = require("cheerio");

const extractImageUrls = (html) => {
  const $ = cheerio.load(html);
  const imageUrls = [];
  $("img").each((i, elem) => {
    imageUrls.push($(elem).attr("src"));
  });
  return imageUrls;
};

module.exports = ({ distDirectory, files, POST_TEMPLATE, HEAD_TEMPLATE }) => {
  const imageFiles = [];

  for (const file of files) {
    const slug = file.head.slug.replaceAll("/", "");
    const fileName = path.join(
      distDirectory,
      process.env.XBLOG_DIST_POST_FOLDER,
      file.head.folderPrefix,
      slug + ".html"
    );
    const buildContent = POST_TEMPLATE.replaceAll("{HEAD}", HEAD_TEMPLATE)
      .replaceAll("{BODY}", file.html)
      .replaceAll("{TITLE}", file.head.title);
    fs.writeFileSync(fileName, buildContent);
    imageFiles.push(...extractImageUrls(file.html));
  }

  return imageFiles.filter(
    (path) => !path.includes("https://") && !path.includes("http://")
  );
};
