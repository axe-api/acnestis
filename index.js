const path = require("path");
const slugify = require("slugify");
const fs = require("fs");
const glob = require("glob");
const showdown = require("showdown");
const cheerio = require("cheerio");
const dayjs = require("dayjs");
const converter = new showdown.Converter();

const getMarkdownFiles = async (src) => {
  return new Promise((resolve) => {
    glob(path.join(src, "/**/*.md"), (err, files) => {
      if (err) {
        console.log("Error", err);
      } else {
        resolve(files);
      }
    });
  });
};

function extractImageUrls(html) {
  const $ = cheerio.load(html);
  const imageUrls = [];
  $("img").each((i, elem) => {
    imageUrls.push($(elem).attr("src"));
  });
  return imageUrls;
}

const splitBlogPost = (fileContent) => {
  const head = {};
  let content = fileContent;

  var regex = /---/gi,
    result,
    indices = [];
  while ((result = regex.exec(fileContent))) {
    indices.push(result.index);
  }

  if (indices.length >= 2) {
    const [start, end] = indices;
    const headAsString = fileContent.substr(start + 3, end - 3);
    const lines = headAsString.split("\n").filter((line) => line);
    for (const line of lines) {
      const splitterIndex = line.indexOf(":");
      const key = line.substr(0, splitterIndex);
      const value = line.substr(splitterIndex + 1);
      if (key && value) {
        head[key] = value;
      }
    }
    content = fileContent.substr(end + 3);
  }

  const title = (head?.title || "").replaceAll('"', "");

  return {
    head: {
      title,
      slug: slugify(title, { lower: true, strict: true }),
      date: head?.date,
      description: head?.description || null,
      meta: head?.meta,
      tags: head?.tags,
    },
    content,
  };
};

const toFileObject = (fullpath) => {
  const fileContent = fs.readFileSync(fullpath, "utf8");
  const { head, content } = splitBlogPost(fileContent);

  const stringDate = head.date.trim().substr(0, 10);
  const date = dayjs(stringDate);
  const year = date.format("YYYY");
  const month = date.format("MM");
  const day = date.format("DD");
  head.jsDate = date;
  head.year = year;
  head.folderPrefix = path.join(year, month, day);

  return {
    fullpath,
    name: path.basename(fullpath),
    content,
    head,
    html: converter.makeHtml(content),
  };
};

const clearDistFolder = (dir) => {
  fs.rmSync(dir, { recursive: true, force: true });
};

const getTemplates = async () => {
  const src = path.join(__dirname, "templates");
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

const moveAssets = (distDir) => {
  const assetPath = path.join(distDir, "assets");
  // Setting the target directory
  if (!fs.existsSync(assetPath)) {
    fs.mkdirSync(assetPath, { recursive: true });
  }

  const assetList = ["styles.css"];

  for (const asset of assetList) {
    const currentPath = path.join(__dirname, "assets", asset);
    const targetPath = path.join(assetPath, asset);
    fs.copyFileSync(currentPath, targetPath);
  }
};

const renderItemTitles = (items) => {
  return items
    .map((item) => {
      const slug = item.head.slug.replaceAll("/", "");
      const link = path.join("/posts", item.head.folderPrefix, slug + ".html");
      return `<a class="article-link" href="${link}">${item.head.title}</a>`;
    })
    .join("\n");
};

const renderByYear = (year, items) => {
  return `
    <div class="year-title">${year.trim()}</div>
    <div class="year-links">
      ${renderItemTitles(items)}
    </div>
  `;
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

const main = async ({ root, posts }) => {
  const start = new Date();

  const distDir = path.join(__dirname, "dist");
  clearDistFolder(distDir);
  fs.mkdirSync(distDir);
  fs.mkdirSync(path.join(distDir, "posts"));

  const TEMPLATES = await getTemplates();
  const POST_TEMPLATE = TEMPLATES.find((i) => i.name === "post.html").content;
  const INDEX_TEMPLATE = TEMPLATES.find((i) => i.name === "index.html").content;
  const HEAD_TEMPLATE = TEMPLATES.find((i) => i.name === "_head.html").content;

  const files = (await getMarkdownFiles(posts)).map(toFileObject);
  let imageFiles = [];

  files.forEach((file) => {
    const folderName = path.join(distDir, "posts", file.head.folderPrefix);
    if (!fs.existsSync(folderName)) {
      fs.mkdirSync(folderName, { recursive: true });
    }
  });

  for (const file of files) {
    const slug = file.head.slug.replaceAll("/", "");
    const fileName = path.join(
      distDir,
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

  imageFiles = imageFiles.filter(
    (path) => !path.includes("https://") && !path.includes("http://")
  );
  for (const imageFile of imageFiles) {
    // The current and the new file path
    const currentPath = `${root}${imageFile}`;
    const newPath = `${distDir}${imageFile}`;

    // Target directory
    const newDirectory = path.dirname(newPath);

    // Setting the target directory
    if (!fs.existsSync(newDirectory)) {
      fs.mkdirSync(newDirectory, { recursive: true });
    }

    // Copying the file
    fs.copyFileSync(currentPath, newPath);
  }

  moveAssets(distDir);

  // Setting index
  const content = INDEX_TEMPLATE.replaceAll("{HEAD}", HEAD_TEMPLATE)
    .replaceAll("{TITLE}", "Ozgur Adem Isikli")
    .replaceAll("{POSTS}", renderPostTemplate(files));
  fs.writeFileSync(path.join(distDir, "index.html"), content);

  const end = new Date() - start;
  console.info("Execution time: %dms", end);
};

main({
  root: path.join(__dirname, "ozziest.github.io"),
  posts: path.join(__dirname, "ozziest.github.io", "_posts"),
});
