const { execFileSync } = require("child_process");
const fs = require("fs");

exports.config = {
  capabilities: [
    {
      browserName: "chrome",
      browserVersion: "stable",
      "goog:chromeOptions": {
        mobileEmulation: {
          // Pixel 6-esque settings
          deviceMetrics: {
            width: 412,
            height: 915,
            pixelRatio: 2.625,
          },
          userAgent:
            "Mozilla/5.0 (Linux; Android 13; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36",
        },
      },
    },
    ...(process.platform === "darwin" && [
      {
        browserName: "Safari",
        platformName: "iOS",
        "safari:deviceType": "iPhone",
        "safari:useSimulator": true,
      },
    ]),
  ],
  connectionRetryTimeout: 10 * 60 * 1000,
  framework: "mocha",
  mochaOpts: {
    timeout: 10 * 60 * 1000,
  },
  runner: "local",
  specs: ["tests/wdio/remocon/**"],
  beforeSession: (_config, caps, _specs) => {
    if (caps["safari:useSimulator"] === true) {
      caps["safari:deviceUDID"] = "6CA1174F-4345-4492-9A41-1FE59BDAD9BA";
    }
  },
  afterSession: (_config, caps, _specs) => {},
};
