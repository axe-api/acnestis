const path = require("path");
const fs = require("fs");
const dayjs = require("dayjs");
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

    if (!file.head?.description) {
      console.warn(`Missing post description: ${file.head.title.trim()}`);
    }

    const buildContent = POST_TEMPLATE.replaceAll(
      "{HEAD}",
      head({
        configuration: {
          title: `${configuration.title} - ${file.head.title.trim()}`,
          description: (
            file.head?.description ||
            configuration?.description ||
            ""
          ).trim(),
          keywords: `${configuration.keywords} ${file.head.keywords}`,
          author: file.head?.author ? file.head.author : configuration.author,
          googleAnalytics: configuration.googleAnalytics,
          lang: (file.head.lang || configuration.lang || "en").trim(),
        },
      })
    )
      .replaceAll("{HEADER}", header({ configuration }))
      .replaceAll("{BODY}", file.html)
      .replaceAll("{TITLE}", file.head.title)
      .replaceAll("{DATE}", dayjs(file.head.date).format("DD MMMM YYYY"))
      .replaceAll("{FOOTER}", footer({ configuration }));
    fs.writeFileSync(fileName, minifyHTML(buildContent));
    imageFiles.push(...extractImageUrls(file.html));
  }

  return imageFiles.filter(
    (path) => !path.includes("https://") && !path.includes("http://")
  );
};
