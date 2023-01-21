const minifier = require("html-minifier").minify;
const CleanCSS = require("clean-css");

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

const minifyCSS = (css) => {
  return new CleanCSS({}).minify(css);
};

module.exports = {
  minifyHTML,
  minifyCSS,
};
