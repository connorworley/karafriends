const path = require("path");

const CopyPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { merge } = require("webpack-merge");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const COMMON_CONFIG = {
  resolve: {
    alias: {
      graphql$: path.resolve(__dirname, "./node_modules/graphql/index.js"),
    },
    extensions: [".js", ".ts", ".tsx", ".graphql", ".glsl", ".node"],
  },
  module: {
    rules: [
      {
        test: /\.s?css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: { publicPath: "/build/renderer" },
          },
          "css-loader",
          "sass-loader",
        ],
      },
      {
        test: /\.tsx?$/,
        use: ["babel-loader", "ts-loader"],
        exclude: /node_modules/,
      },
      {
        test: /\.(graphql|glsl)$/,
        use: "raw-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.node$/,
        loader: "node-loader",
      },
      {
        test: /\.(otf|ttf)$/,
        type: "asset/resource",
      },
    ],
  },
};

module.exports = [
  merge(COMMON_CONFIG, {
    target: "electron-main",
    entry: "./src/main/index.ts",
    output: {
      path: path.resolve(__dirname, "build", "main"),
    },
    externals: {
      // Needed because niconico needs jsdom and jsdom wants canvas
      // But we don't actually need canvas
      // https://github.com/jsdom/jsdom/issues/1708
      canvas: "{}",
    },
  }),
  merge(COMMON_CONFIG, {
    target: "electron-preload",
    entry: "./src/preload/index.ts",
    output: {
      path: path.resolve(__dirname, "build", "preload"),
    },
  }),
];
