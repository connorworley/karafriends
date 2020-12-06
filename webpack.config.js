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
    // Technically this should be electron-renderer, but we want to be able to import nodejs stuff
    // so we have to target electron-main insted.
    target: "electron-main",
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
    },
  }),
  merge(COMMON_CONFIG, {
    target: "web",
    entry: "./src/remocon/index.tsx",
    output: {
      path: path.resolve(__dirname, "build", "remocon"),
    },
    plugins: [new HtmlWebpackPlugin()],
  }),
];
