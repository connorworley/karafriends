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
        use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
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
    target: "web", // our renderer is rather locked down
    entry: "./src/renderer/index.tsx",
    output: {
      path: path.resolve(__dirname, "build", "renderer"),
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: "./src/renderer/index.html",
      }),
      new MiniCssExtractPlugin(),
    ],
    devServer: {
      port: 3000,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      allowedHosts: [".karafriends.local"],
    },
  }),
  merge(COMMON_CONFIG, {
    target: "electron-preload",
    entry: "./src/preload/index.ts",
    output: {
      path: path.resolve(__dirname, "build", "preload"),
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
      new CopyPlugin({
        patterns: [
          {
            from: "icon.png",
          },
        ],
      }),
    ],
  }),
];
