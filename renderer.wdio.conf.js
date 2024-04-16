const { resolve } = require("path");

exports.config = {
  capabilities: [
    {
      browserName: "electron",
      "wdio:electronServiceOptions": {
        appBinaryPath: resolve(__dirname, "build/dev/main/main.js"),
      },
    },
  ],
  connectionRetryTimeout: 5 * 60 * 1000,
  framework: "mocha",
  mochaOpts: {
    timeout: 5 * 60 * 1000,
  },
  runner: "local",
  specs: ["tests/wdio/renderer/**"],
};
