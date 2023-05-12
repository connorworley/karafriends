const { spawnSync } = require("child_process");

const sevenBin = require("7zip-bin");
const packager = require("electron-packager");
const { glob } = require("glob");

(async () => {
  const buildFiles = new Set([
    "",
    "/package.json",
    "/build",
    ...(await glob("build/prod/**", { posix: true })).map((path) => `/${path}`),
  ]);
  const output = await packager({
    dir: ".",
    extraResource: ["extraResources"],
    ignore: (path) => !buildFiles.has(path),
    out: "dist",
    overwrite: true,
    ...(process.platform === "darwin" && {
      icon: "appIcons/icon.icns",
      osxSign: {
        identity: "Apple Distribution: Connor Worley (WZ6JC3T383)",
      },
    }),
    ...(process.platform === "win32" && {
      icon: "appIcons/icon.ico",
    }),
  });
  console.log(`Built ${output}. Zipping...`);
  spawnSync(sevenBin.path7za, ["a", "-r", `${output}.zip`, output]);
  console.log(`Built ${output}.zip.`);
})();
