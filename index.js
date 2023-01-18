const path = require("path");
const slugify = require("slugify");
const fs = require("fs");
const glob = require("glob");
const showdown = require("showdown");
const converter = new showdown.Converter();

const getFileNames = async (src) => {
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

const splitBlogPost = (fileContent) => {
  const head = {};
  let content = fileContent;

  var regex = /---/gi,
    result,
    indices = [];
  while ((result = regex.exec(fileContent))) {
    indices.push(result.index);
  }

  if (indices.length === 2) {
    const [start, end] = indices;
    const headAsString = fileContent.substr(start + 3, end - 3);
    const lines = headAsString.split("\n").filter((line) => line);
    for (const line of lines) {
      const [key, value] = line.split(":");
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

const main = async ({ root }) => {
  const start = new Date();

  const distDir = path.join(__dirname, "dist");
  clearDistFolder(distDir);
  fs.mkdirSync(distDir);
  fs.mkdirSync(path.join(distDir, "posts"));

  const TEMPLATES = await getTemplates();
  const POST_TEMPLATE = TEMPLATES.find((i) => i.name === "post.html").content;

  const files = (await getFileNames(root)).map(toFileObject);

  for (const file of files) {
    const htlmName = path.join(
      distDir,
      "posts",
      file.head.slug.replaceAll("/", "") + ".html"
    );
    const buildContent = POST_TEMPLATE.replaceAll("{BODY}", file.html);
    fs.writeFileSync(htlmName, buildContent);
  }

  const end = new Date() - start;
  console.info("Execution time: %dms", end);
};

main({ root: path.join(__dirname, "ozziest.github.io", "_posts") });
