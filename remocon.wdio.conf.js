const { execFileSync } = require("child_process");

const KARAFRIENDS_SIM_DEVICE_NAME = "_karafriends_sim_device";

function findOrCreateAppleSimDeviceUdid(runtime, deviceType) {
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
    if (device) return device.udid;
  }

  return execFileSync(
    "xcrun",
    ["simctl", "create", KARAFRIENDS_SIM_DEVICE_NAME, deviceType, runtime],
    { encoding: "utf-8" }
  );
}

exports.config = {
  capabilities: [
    {
      browserName: "chrome",
      "goog:chromeOptions": {
        mobileEmulation: {
          deviceName: "Pixel 5",
        },
      },
    },
    ...(process.platform === "darwin" && [
      {
        browserName: "Safari",
        platformName: "iOS",
        "safari:deviceType": "iPhone",
        "safari:deviceUDID": findOrCreateAppleSimDeviceUdid(
          "com.apple.CoreSimulator.SimRuntime.iOS-16-2",
          "com.apple.CoreSimulator.SimDeviceType.iPhone-12"
        ),
        "safari:useSimulator": true,
      },
    ]),
  ],
  framework: "mocha",
  runner: "local",
  services: [["chromedriver"], ["safaridriver"]],
  specs: ["tests/wdio/remocon/**"],
};
