const packager = require("electron-packager");
const { glob } = require("glob");

(async () => {
  const buildFiles = new Set([
    "",
    "/package.json",
    "/build",
    ...(await glob("build/prod/**")).map((path) => `/${path}`),
  ]);
  const outputs = await packager({
    dir: ".",
    extraResource: ["extraResources"],
    ignore: (path) => !buildFiles.has(path),
    out: "dist",
    overwrite: true,
    ...(process.platform === "darwin" && {
      icon: "appIcons/icon.icns",
      osxSign: {
        identity: "Apple Distribution: Connor Alberts (WZ6JC3T383)",
      },
    }),
    ...(process.platform === "win32" && {
      icon: "appIcons/icon.ico",
    }),
  });
  console.log(`Built ${outputs}.`);
})();
