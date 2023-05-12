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
      appBundleId: "party.karafriends",
      icon: "appIcons/icon.icns",
      osxNotarize: {
        tool: "notarytool",
        appleApiKey: process.env.NOTARIZATION_KEY_PATH,
        appleApiKeyId: "Z4H7RZ6QUT",
        appleApiIssuer: "69a6de70-1249-47e3-e053-5b8c7c11a4d1",
      },
      osxSign: {
        identity: "Developer ID Application: Connor Worley (WZ6JC3T383)",
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
