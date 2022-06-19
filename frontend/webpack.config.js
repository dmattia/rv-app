const path = require("path");
const Dotenv = require("dotenv-webpack");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  context: __dirname,
  entry: "./src/main.tsx",
  mode: "development",
  plugins: [
    new Dotenv({
      path: "./.env",
    }),
    new HtmlWebpackPlugin({
      template: "public/index.html",
    }),
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: require.resolve("ts-loader"),
          options: {
            projectReferences: true,
            transpileOnly: true,
          },
        },
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader", "postcss-loader"],
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    fallback: {
      path: require.resolve("path-browserify"),
      fs: false,
    },
  },
  devServer: {
    compress: true,
    hot: true,
    historyApiFallback: {
      index: "/",
    },
  },
  output: {
    publicPath: "/",
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),
  },
};
