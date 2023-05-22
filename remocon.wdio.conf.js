const { execFileSync } = require("child_process");

exports.config = {
  capabilities: [
    {
      browserName: "chrome",
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
  connectionRetryTimeout: 5 * 60 * 1000,
  framework: "mocha",
  mochaOpts: {
    timeout: 60 * 1000,
  },
  runner: "local",
  services: [["chromedriver"], ["safaridriver"]],
  specs: ["tests/wdio/remocon/**"],
  beforeSession: (_config, caps, _specs) => {
    if (caps["safari:useSimulator"] === true) {
      const udid = execFileSync(
        "xcrun",
        [
          "simctl",
          "create",
          "karafriendsIntegrationDevice",
          "com.apple.CoreSimulator.SimDeviceType.iPhone-12",
          "com.apple.CoreSimulator.SimRuntime.iOS-16-2",
        ],
        { encoding: "utf-8" }
      ).trim();
      execFileSync("xcrun", ["simctl", "bootstatus", udid, "-b"], {
        stdio: "inherit",
      });
      caps["safari:deviceUDID"] = udid;
    }
  },
  afterSession: (_config, caps, _specs) => {
    if (caps["safari:useSimulator"] === true) {
      execFileSync("xcrun", ["simctl", "delete", caps["safari:deviceUDID"]], {
        stdio: "inherit",
      });
    }
  },
};
