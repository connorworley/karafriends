const { resolve } = require("path");

exports.config = {
  capabilities: [
    {
      browserName: "electron",
      "wdio:electronServiceOptions": {
        appBinaryPath: resolve(__dirname, "electron.js"),
        appArgs: [`app=${resolve(__dirname, "build/dev/main_/index.js")}`],
      },
    },
  ],
  connectionRetryTimeout: 5 * 60 * 1000,
  framework: "mocha",
  mochaOpts: {
    timeout: 5 * 60 * 1000,
  },
  runner: "local",
  services: ["electron"],
  specs: ["tests/wdio/renderer/**"],
};
