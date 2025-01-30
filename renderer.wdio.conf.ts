import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const repoRoot = dirname(fileURLToPath(import.meta.url));

console.log(
  `Dev port: ${process.env.KARAFRIENDS_DEV_PORT}, remocon port: ${process.env.KARAFRIENDS_REMOCON_PORT}`,
);

export const config = {
  capabilities: [
    {
      browserName: "electron",
      "wdio:electronServiceOptions": {
        appBinaryPath: resolve(repoRoot, "electron.js"),
        appArgs: [
          `app=${resolve(repoRoot, "build", "dev", "main_", "index.js")}`,
        ],
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
