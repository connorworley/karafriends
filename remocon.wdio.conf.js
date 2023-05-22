const { execFileSync } = require("child_process");

const KARAFRIENDS_SIM_DEVICE_NAME = "_karafriends_sim_device";

function bootAppleSimDevice(udid) {
  execFileSync("xcrun", ["simctl", "boot", udid]);
}

function findOrCreateAppleSimDevice(runtime, deviceType) {
  const simInfo = JSON.parse(
    execFileSync("xcrun", ["simctl", "list", "devices", "--json"], {
      encoding: "utf-8",
    })
  );
  if (simInfo.devices[runtime]) {
    const device = simInfo.devices[runtime].find(
      (device) =>
        device.deviceTypeIdentifier === deviceType &&
        device.name === KARAFRIENDS_SIM_DEVICE_NAME
    );
    if (device) {
      if (device.state !== "Booted") bootAppleSimDevice(device.udid);
      return device.udid;
    }
  }

  const udid = execFileSync(
    "xcrun",
    ["simctl", "create", KARAFRIENDS_SIM_DEVICE_NAME, deviceType, runtime],
    { encoding: "utf-8" }
  ).trim();
  bootAppleSimDevice(udid);
  return udid;
}

exports.config = {
  capabilities: [
    {
      browserName: "chrome",
      "goog:chromeOptions": {
        mobileEmulation: {
          // Pixel 6-esque settings
          deviceMetrics: {
            width: 1080,
            height: 2400,
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
        "safari:deviceUDID": findOrCreateAppleSimDevice(
          "com.apple.CoreSimulator.SimRuntime.iOS-16-2",
          "com.apple.CoreSimulator.SimDeviceType.iPhone-12"
        ),
        "safari:useSimulator": true,
      },
    ]),
  ],
  framework: "mocha",
  mochaOpts: {
    timeout: 60000,
  },
  runner: "local",
  services: [["chromedriver"], ["safaridriver"]],
  specs: ["tests/wdio/remocon/**"],
};
