const path = require("path");
const fs = require("fs");
const { minifyHTML } = require("./shared");
const header = require("./header");

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
      const link = path.join(
        "/",
        item.head.category,
        item.head.folderPrefix,
        slug + ".html"
      );
      console.log(item.head.folderPrefix);
      return `
      <div class="link-container">
        <a class="article-link" href="${link}">${item.head.title}</a>
        <div class="link-date">${item.head.jsDate.format("DD MMM")}</div>
      </div>
      `;
    })
    .join("\n");
};

module.exports = ({ INDEX_TEMPLATE, HEAD_TEMPLATE, files, distDirectory }) => {
  // Setting index
  const content = INDEX_TEMPLATE.replaceAll("{HEAD}", HEAD_TEMPLATE)
    .replaceAll("{HEADER}", header("Özgür Adem IŞIKLI"))
    .replaceAll("{POSTS}", renderPostTemplate(files));
  fs.writeFileSync(path.join(distDirectory, "index.html"), minifyHTML(content));
};
