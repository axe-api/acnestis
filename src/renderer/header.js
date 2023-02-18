const path = require("path");
const fs = require("fs");

module.exports = ({ configuration }) => {
  const templatePath = path.join(
    process.env.XBLOG_TEMPLATE_FOLDER,
    "_header.html"
  );
  let template = fs.readFileSync(templatePath, "utf-8");
  const aboutExists = fs.existsSync(path.join(process.cwd(), "about.md"));

  if (configuration.theme === "both") {
    template = template
      .replaceAll(
        "{THEME_SCRIPT}",
        fs.readFileSync(
          path.join(process.env.XBLOG_TEMPLATE_FOLDER, "_theme-change.html"),
          "utf-8"
        )
      )
      .replaceAll(
        "{THEME_BUTTON}",
        fs.readFileSync(
          path.join(process.env.XBLOG_TEMPLATE_FOLDER, "_theme-button.html"),
          "utf-8"
        )
      )
      .replaceAll("{SELECTED_THEME}", "");
  } else {
    template = template
      .replaceAll("{THEME_SCRIPT}", "")
      .replaceAll("{THEME_BUTTON}", "");
  }

  return template
    .replaceAll("{TITLE}", configuration.title)
    .replaceAll(
      "{ABOUT_LINK}",
      aboutExists ? `<a class="about" href="/about">About</a>` : ""
    );
};
