const minifier = require("html-minifier").minify;

const minifyHTML = (html) => {
  return minifier(html, {
    removeAttributeQuotes: true,
    minifyJS: true,
    removeComments: true,
    removeEmptyAttributes: true,
    collapseBooleanAttributes: true,
    collapseWhitespace: true,
  });
};

module.exports = {
  minifyHTML,
};
