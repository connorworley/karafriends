#!/usr/bin/node
import fetch from "node-fetch";
import sevenBin from "7zip-bin";
import fs from "fs";
import os from "os";
import path from "path";
import process from "process";
import { exec } from "child_process";

const pathTo7zip = sevenBin.path7za;
const extraResourcesDir = `${process.cwd()}/extraResources`;
const maxMsToWaitForExtraction = 20000;

async function fetchWithRetries(url, retries) {
  return fetch(url).then((res) => {
    if (res.ok) {
      return res;
    }
    if (retries > 0) {
      return fetchWithRetries(url, retries - 1);
    }
    throw new Error(res.status);
  });
}

async function downloadFile(url, path) {
  const res = await fetchWithRetries(url, 3);
  const fileStream = fs.createWriteStream(path);
  await new Promise((resolve, reject) => {
    res.body.pipe(fileStream);
    res.body.on("error", reject);
    fileStream.on("finish", resolve);
  });
}

const winTasks = {
  doChecks: () => [
    fs.existsSync(`${extraResourcesDir}/ytdlp/yt-dlp.exe`),
    fs.existsSync(`${extraResourcesDir}/ffmpeg/win/ffmpeg.exe`),
  ],
  prepareDirs: async (tmpDir) =>
    Promise.all([
      fs.mkdir(`${tmpDir}/ffmpeg/win`, { recursive: true }, () => null),
      fs.mkdir(`${extraResourcesDir}/ytdlp`, { recursive: true }, () => null),
      fs.mkdir(
        `${extraResourcesDir}/ffmpeg/win`,
        { recursive: true },
        () => null
      ),
    ]),
  getAssets: async (tmpDir) =>
    Promise.all([
      downloadFile(
        "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe",
        `${extraResourcesDir}/ytdlp/yt-dlp.exe`
      ),
      downloadFile(
        "https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-full.7z",
        `${tmpDir}/ffmpeg/win/ffmpeg.7z`
      ),
    ]),
  extractAssets: async (tmpDir, hasFinishedExtracting) => {
    exec(
      `${pathTo7zip} e ${tmpDir}/ffmpeg/win/ffmpeg.7z -y -o${tmpDir}/ffmpeg/win/contents`,
      (error, stdout, stderr) => {
        fs.rename(
          `${tmpDir}/ffmpeg/win/contents/ffmpeg.exe`,
          `${extraResourcesDir}/ffmpeg/win/ffmpeg.exe`,
          (err) => {
            if (err) {
              console.error(error);
            }
            hasFinishedExtracting[0] = true;
          }
        );
      }
    );
  },
  setPermissions: () => null,
};

const macosTasks = {
  doChecks: () => [
    fs.existsSync(`${extraResourcesDir}/ytdlp/yt-dlp_macos`),
    fs.existsSync(`${extraResourcesDir}/ffmpeg/macos/ffmpeg`),
  ],
  prepareDirs: async (tmpDir) =>
    Promise.all([
      fs.mkdir(`${tmpDir}/ffmpeg/macos`, { recursive: true }, () => null),
      fs.mkdir(`${extraResourcesDir}/ytdlp`, { recursive: true }, () => null),
      fs.mkdir(
        `${extraResourcesDir}/ffmpeg/macos`,
        { recursive: true },
        () => null
      ),
    ]),
  getAssets: async (tmpDir) =>
    Promise.all([
      downloadFile(
        "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_macos",
        `${extraResourcesDir}/ytdlp/yt-dlp_macos`
      ),
      downloadFile(
        "https://evermeet.cx/ffmpeg/ffmpeg-5.0.1.zip",
        `${tmpDir}/ffmpeg/macos/ffmpeg.zip`
      ),
    ]),
  extractAssets: async (tmpDir, hasFinishedExtracting) => {
    exec(
      `${pathTo7zip} e ${tmpDir}/ffmpeg/macos/ffmpeg.zip -y -o${tmpDir}/ffmpeg/macos/contents`,
      (error, stdout, stderr) => {
        fs.rename(
          `${tmpDir}/ffmpeg/macos/contents/ffmpeg`,
          `${extraResourcesDir}/ffmpeg/macos/ffmpeg`,
          (err) => {
            if (err) {
              console.error(error);
            }
            hasFinishedExtracting[0] = true;
          }
        );
      }
    );
  },
  setPermissions: () => {
    fs.chmodSync(`${extraResourcesDir}/ffmpeg/macos/ffmpeg`, "755");
    fs.chmodSync(`${extraResourcesDir}/ytdlp/yt-dlp_macos`, "755");
  },
};

const linuxTasks = {
  doChecks: () => [
    fs.existsSync(`${extraResourcesDir}/ytdlp/yt-dlp`),
    fs.existsSync(`${extraResourcesDir}/ffmpeg/linux/ffmpeg`),
  ],
  prepareDirs: async (tmpDir) =>
    Promise.all([
      fs.mkdir(`${tmpDir}/ffmpeg/linux`, { recursive: true }, () => null),
      fs.mkdir(`${extraResourcesDir}/ytdlp`, { recursive: true }, () => null),
      fs.mkdir(
        `${extraResourcesDir}/ffmpeg/linux`,
        { recursive: true },
        () => null
      ),
    ]),
  getAssets: async (tmpDir) =>
    Promise.all([
      downloadFile(
        "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp",
        `${extraResourcesDir}/ytdlp/yt-dlp`
      ),
      downloadFile(
        "https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz",
        `${tmpDir}/ffmpeg/linux/ffmpeg.tar.xz`
      ),
    ]),
  extractAssets: async (tmpDir, hasFinishedExtracting) => {
    exec(
      `${pathTo7zip} e ${tmpDir}/ffmpeg/linux/ffmpeg.tar.xz -y -o${tmpDir}/ffmpeg/linux/xz`,
      (error, stdout, stderr) => {
        exec(
          `${pathTo7zip} e ${tmpDir}/ffmpeg/linux/xz/ffmpeg.tar -y -o${tmpDir}/ffmpeg/linux/contents`,
          (error, stdout, stderr) => {
            fs.rename(
              `${tmpDir}/ffmpeg/linux/contents/ffmpeg`,
              `${extraResourcesDir}/ffmpeg/linux/ffmpeg`,
              (err) => {
                if (err) {
                  console.error(error);
                }
                hasFinishedExtracting[0] = true;
              }
            );
          }
        );
      }
    );
  },
  setPermissions: () => {
    fs.chmodSync(`${extraResourcesDir}/ffmpeg/linux/ffmpeg`, "755");
    fs.chmodSync(`${extraResourcesDir}/ytdlp/yt-dlp`, "755");
  },
};

async function getExternalResources(tasks) {
  if (tasks.doChecks().every((check) => check === true)) {
    return;
  }
  const tmpDir = fs.mkdtempSync(
    path.join(os.tmpdir(), "karafriends_getExternalResources")
  );
  await tasks.prepareDirs(tmpDir);
  await tasks.getAssets(tmpDir);

  let hasFinishedExtracting = [false];
  let msToWaitForExtraction = maxMsToWaitForExtraction;
  await tasks.extractAssets(tmpDir, hasFinishedExtracting);
  await new Promise(async () => {
    while (msToWaitForExtraction > 0 && !hasFinishedExtracting[0]) {
      await new Promise((r) => setTimeout(r, 200));
      msToWaitForExtraction -= 200;
    }
    fs.rmdirSync(tmpDir, { recursive: true });
    if (!hasFinishedExtracting[0]) {
      console.error(
        `Extracting ffmpeg did not complete after ${maxMsToWaitForExtraction} ms and was aborted!`
      );
      process.exit(1);
    }
    tasks.setPermissions();
    process.exit(0);
  });
}

const tasks =
  process.platform === "win32"
    ? winTasks
    : process.platform === "darwin"
    ? macosTasks
    : linuxTasks;

await getExternalResources(tasks);
