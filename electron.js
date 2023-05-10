const { spawnSync } = require("child_process");
const { resolve } = require("path");

const electron = require("electron");

spawnSync(
  electron,
  process.argv.slice(process.argv.findIndex((arg) => arg === __filename) + 1),
  {
    env: {
      ...process.env,
      NODE_OPTIONS: `'--require=${resolve(__dirname, ".pnp.cjs")}'`,
    },
    stdio: "inherit",
  }
);
