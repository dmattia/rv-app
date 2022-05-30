const path = require("path");
const Dotenv = require("dotenv-webpack");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: "./src/main.tsx",
  mode: "development",
  plugins: [
    new Dotenv({
      path: "./.env",
    }),
    // new webpack.ProvidePlugin({
    //   process: 'process/browser',
    // }),
    new HtmlWebpackPlugin({
      template: "public-test/index.html",
    }),
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  devServer: {
    // static: {
    //   directory: path.join(__dirname, 'public'),
    // },
    compress: true,
    hot: true,
  },
  output: {
    filename: "main.js",
    // publicPath: path.resolve(__dirname, 'public'),
    path: path.resolve(__dirname, "dist"),
  },
};
