const path = require("path");

const { merge } = require("webpack-merge");

const COMMON_CONFIG = {
  resolve: {
    alias: {
      graphql$: path.resolve(__dirname, "./node_modules/graphql/index.js"),
    },
    extensions: [".js", ".ts", ".graphql", ".node"],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
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
