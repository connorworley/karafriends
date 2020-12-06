const path = require("path");

const HtmlWebpackPlugin = require("html-webpack-plugin");
const { merge } = require("webpack-merge");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const COMMON_CONFIG = {
  resolve: {
    extensions: [".js", ".ts", ".tsx"],
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
        exclude: /node_modules/,
      },
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  output: {
    path: path.resolve(__dirname, "dist"),
  },
};

module.exports = [
  merge(COMMON_CONFIG, {
    target: "electron-main",
    entry: "./src/main/index.ts",
    output: {
      filename: "main.js",
    },
  }),
  merge(COMMON_CONFIG, {
    target: "electron-renderer",
    entry: "./src/renderer/index.tsx",
    output: {
      filename: "renderer.js",
    },
    plugins: [
      new HtmlWebpackPlugin({
        filename: "renderer.html",
        template: "src/renderer/index.html",
      }),
      new MiniCssExtractPlugin({
        filename: "renderer.css",
      }),
    ],
    devServer: {
      index: "renderer.html",
      port: 3000,
    },
  }),
  merge(COMMON_CONFIG, {
    target: "web",
    entry: "./src/remocon/index.tsx",
    output: {
      filename: "remocon.js",
    },
    plugins: [
      new HtmlWebpackPlugin({
        filename: "remocon.html",
      }),
    ],
  }),
];
