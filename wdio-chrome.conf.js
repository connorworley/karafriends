exports.config = {
  capabilities: [
    {
      browserName: "chrome",
    },
  ],
  framework: "mocha",
  runner: "local",
  services: [["chromedriver"]],
  specs: ["tests/wdio/chrome/**"],
};
