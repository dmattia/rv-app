const { join } = require("path");

module.exports = {
  require: ["ts-node/register/transpile-only"],
  ignore: [
    "**/build/**/*",
    "**/dist/**/*",
    "**/node_modules/**/*",
    "**/.yarn/**/*",
  ],
  watchFiles: [],
  extension: ["ts"],
  colors: true,
};

process.env.NODE_ENV = "test";
