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
  connectionRetryTimeout: 5 * 60 * 1000,
  framework: "mocha",
  mochaOpts: {
    timeout: 5 * 60 * 1000,
  },
  runner: "local",
  services: [
    ["chromedriver", { chromedriverCustomPath: electronChromedriver }],
  ],
  specs: ["tests/wdio/renderer/**"],
};
