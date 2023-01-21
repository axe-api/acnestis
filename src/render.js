const path = require("path");
const fs = require("fs");
const cheerio = require("cheerio");

const createDateDirectories = (distDirectory, files) => {
  files.forEach((file) => {
    const folderName = path.join(
      distDirectory,
      "posts",
      file.head.folderPrefix
    );
    if (!fs.existsSync(folderName)) {
      fs.mkdirSync(folderName, { recursive: true });
    }
  });
};

const createBlogPosts = ({
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
      "posts",
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

const extractImageUrls = (html) => {
  const $ = cheerio.load(html);
  const imageUrls = [];
  $("img").each((i, elem) => {
    imageUrls.push($(elem).attr("src"));
  });
  return imageUrls;
};

const createIndexPage = ({
  INDEX_TEMPLATE,
  HEAD_TEMPLATE,
  files,
  distDirectory,
}) => {
  // Setting index
  const content = INDEX_TEMPLATE.replaceAll("{HEAD}", HEAD_TEMPLATE)
    .replaceAll("{TITLE}", "Ozgur Adem Isikli")
    .replaceAll("{POSTS}", renderPostTemplate(files));
  fs.writeFileSync(path.join(distDirectory, "index.html"), content);
};

const renderPostTemplate = (files) => {
  files.sort((a, b) => b.head.jsDate.unix() - a.head.jsDate.unix());

  const groupByYears = files.reduce((group, file) => {
    const { head } = file;
    group[head.year] = group[head.year] ?? [];
    group[head.year].push(file);
    return group;
  }, {});

  let result = "";

  for (const year of Object.keys(groupByYears).sort((a, b) => b - a)) {
    const items = groupByYears[year];

    result += renderByYear(year, items);
  }

  return result;
};

const renderByYear = (year, items) => {
  return `
    <div class="year-title">${year.trim()}</div>
    <div class="year-links">
      ${renderItemTitles(items)}
    </div>
  `;
};

const renderItemTitles = (items) => {
  return items
    .map((item) => {
      const slug = item.head.slug.replaceAll("/", "");
      const link = path.join("/posts", item.head.folderPrefix, slug + ".html");
      return `
      <div class="link-container">
        <a class="article-link" href="${link}">${item.head.title}</a>
        <div class="link-date">${item.head.jsDate.format("DD MMM")}</div>
      </div>
      `;
    })
    .join("\n");
};

module.exports = {
  createDateDirectories,
  createBlogPosts,
  createIndexPage,
};
