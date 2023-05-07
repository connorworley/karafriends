const path = require("path");

const { merge } = require("webpack-merge");

// We need to ensure that all dependencies use the same graphql installation, so we force the top-level one.
const topLevelGraphql = require.resolve("graphql");

const COMMON_CONFIG = {
  devtool: "inline-cheap-module-source-map",
  resolve: {
    alias: {
      graphql$: topLevelGraphql,
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

module.exports = (env, argv) => [
  merge(COMMON_CONFIG, {
    target: "electron-main",
    entry: "./src/main/index.ts",
    output: {
      path: path.resolve(
        __dirname,
        "build",
        argv.mode === "production" ? "prod" : "dev",
        "main"
      ),
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
      path: path.resolve(
        __dirname,
        "build",
        argv.mode === "production" ? "prod" : "dev",
        "preload"
      ),
    },
  }),
];
