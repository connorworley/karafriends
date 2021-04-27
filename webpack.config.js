const path = require("path");

const HtmlWebpackPlugin = require("html-webpack-plugin");
const { merge } = require("webpack-merge");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const RelayCompilerWebpackPlugin = require("relay-compiler-webpack-plugin");
const RelayCompilerLanguageTypescript = require("relay-compiler-language-typescript")
  .default;

const COMMON_CONFIG = {
  mode: "development",
  resolve: {
    alias: {
      graphql$: path.resolve(__dirname, "./node_modules/graphql/index.js"),
    },
    extensions: [".js", ".ts", ".tsx", ".graphql", ".node"],
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
      {
        test: /\.tsx?$/,
        use: ["babel-loader", "ts-loader"],
        exclude: /node_modules/,
      },
      {
        test: /\.graphql$/,
        use: "raw-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.node$/,
        loader: "node-loader",
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
  }),
  merge(COMMON_CONFIG, {
    target: "electron-renderer",
    entry: "./src/renderer/index.tsx",
    output: {
      path: path.resolve(__dirname, "build", "renderer"),
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: "./src/renderer/index.html",
      }),
      new MiniCssExtractPlugin(),
      new RelayCompilerWebpackPlugin({
        src: "./src/renderer",
        schema: "./src/common/schema.graphql",
        languagePlugin: RelayCompilerLanguageTypescript,
      }),
    ],
    devServer: {
      port: 3000,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    },
  }),
  merge(COMMON_CONFIG, {
    target: "web",
    entry: "./src/remocon/index.tsx",
    output: {
      path: path.resolve(__dirname, "build", "remocon"),
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: "./src/remocon/index.html",
      }),
      new MiniCssExtractPlugin(),
      new RelayCompilerWebpackPlugin({
        src: "./src/remocon",
        schema: "./src/common/schema.graphql",
        languagePlugin: RelayCompilerLanguageTypescript,
      }),
    ],
  }),
];
