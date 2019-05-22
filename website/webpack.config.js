const path = require("path");

module.exports = {
  entry: path.resolve(
    __dirname,
    "./node_modules/codesandbox/lib/api/define.js"
  ),
  output: {
    path: path.resolve(__dirname, "./static/js"),
    filename: "codesandbox.js",
    library: "codesandbox"
  }
};
