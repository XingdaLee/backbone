var path = require("path");
module.exports = {
  entry: {
    app: []
  },
  output: {
    path: path.resolve(__dirname, "build"),
    publicPath: "/index.html",
    filename: "bundle.js"
  }
};
