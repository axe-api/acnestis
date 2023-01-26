const path = require("path");
const fs = require("fs");
const slugify = require("slugify");
const glob = require("glob");
const showdown = require("showdown");
const dayjs = require("dayjs");
const converter = new showdown.Converter();

const getMdFiles = async (src) => {
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
      category: head?.categories
        ? head.categories
            .replaceAll("[", "")
            .replaceAll("]", "")
            .toLowerCase()
            .split(",")
            .map((item) => slugify(item.trim(), { lower: true, strict: true }))
            .join("/")
        : "",
      slug: slugify(title, {
        lower: true,
        strict: true,
      }),
      date: head?.date,
      description: head?.description || null,
      meta: head?.meta,
      tags: head?.tags,
    },
    content,
  };
};

const getMarkdownFiles = async (directory) => {
  return (await getMdFiles(directory)).map(toFileObject);
};

module.exports = {
  getMarkdownFiles,
};
