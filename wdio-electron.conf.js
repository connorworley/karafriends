const { resolve } = require("path");

const electronChromedriver = require.resolve(
  "electron-chromedriver/chromedriver.js"
);

exports.config = {
  capabilities: [
    {
      browserName: "chrome",
      "goog:chromeOptions": {
        binary: resolve(__dirname, "electron.js"),
        args: [`app=${resolve(__dirname, "build/dev/main/main.js")}`],
      },
    },
  ],
  framework: "mocha",
  runner: "local",
  services: [
    ["chromedriver", { chromedriverCustomPath: electronChromedriver }],
  ],
  specs: ["tests/wdio/electron/**"],
};
