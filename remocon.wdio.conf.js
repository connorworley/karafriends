const { execFileSync } = require("child_process");

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
  connectionRetryTimeout: 5 * 60 * 1000,
  framework: "mocha",
  mochaOpts: {
    timeout: 5 * 60 * 1000,
  },
  runner: "local",
  specs: ["tests/wdio/remocon/**"],
  beforeSession: (_config, caps, _specs) => {
    if (caps["safari:useSimulator"] === true) {
      const desiredDeviceType =
        "com.apple.CoreSimulator.SimDeviceType.iPhone-12";
      const desiredRuntime = "com.apple.CoreSimulator.SimRuntime.iOS-17-4";

      const devices = JSON.parse(
        execFileSync(
          "xcrun",
          ["simctl", "list", "--json", "devices", "available"],
          { encoding: "utf-8" }
        )
      );

      let udid = null;

      if (devices["devices"] && devices["devices"][desiredRuntime]) {
        const device = devices["devices"][desiredRuntime].filter(
          (device) => device.deviceTypeIdentifier === desiredDeviceType
        )[0];
        if (device) {
          udid = device["udid"];
          console.log(`Selected device: ${device["name"]}`);
        }
      }

      if (!udid) {
        throw new Error("Could not find a suitable sim device!");
      }
      execFileSync("xcrun", ["simctl", "bootstatus", udid, "-b"], {
        stdio: "inherit",
      });
      caps["safari:deviceUDID"] = udid;
    }
  },
  afterSession: (_config, caps, _specs) => {
    if (caps["safari:useSimulator"] === true) {
      execFileSync("xcrun", ["simctl", "shutdown", caps["safari:deviceUDID"]], {
        stdio: "inherit",
      });
    }
  },
};
