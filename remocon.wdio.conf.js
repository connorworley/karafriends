const { execFileSync } = require("child_process");

function iOsSimDeviceUdidByDeviceTypeId(deviceTypeId) {
  const simInfo = JSON.parse(
    execFileSync("xcrun", ["simctl", "list", "devices", "--json"])
  );
  console.log(simInfo);
  return Object.values(simInfo.devices)[0].filter(
    (device) => device.deviceTypeIdentifier === deviceTypeId
  )[0];
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
        "safari:deviceUDID": iOsSimDeviceUdidByDeviceTypeId(
          "com.apple.CoreSimulator.SimDeviceType.iPhone-14"
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
