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

async function getExternalResources() {
  const externalResourceChecks = [
    fs.existsSync(`${extraResourcesDir}/ytdlp/yt-dlp`),
    fs.existsSync(`${extraResourcesDir}/ytdlp/yt-dlp.exe`),
    fs.existsSync(`${extraResourcesDir}/ytdlp/yt-dlp_macos`),
    fs.existsSync(`${extraResourcesDir}/ffmpeg/win/ffmpeg.exe`),
    fs.existsSync(`${extraResourcesDir}/ffmpeg/macos/ffmpeg`),
    fs.existsSync(`${extraResourcesDir}/ffmpeg/linux/ffmpeg`),
  ];
  if (externalResourceChecks.every((check) => check === true)) {
    return;
  }
  const tmpDir = fs.mkdtempSync(
    path.join(os.tmpdir(), "karafriends_getExternalResources")
  );
  await Promise.all([
    fs.mkdir(`${tmpDir}/ffmpeg/win`, { recursive: true }, () => null),
    fs.mkdir(`${tmpDir}/ffmpeg/macos`, { recursive: true }, () => null),
    fs.mkdir(`${tmpDir}/ffmpeg/linux`, { recursive: true }, () => null),
    fs.mkdir(`${extraResourcesDir}/ytdlp`, { recursive: true }, () => null),
    fs.mkdir(
      `${extraResourcesDir}/ffmpeg/win`,
      { recursive: true },
      () => null
    ),
    fs.mkdir(
      `${extraResourcesDir}/ffmpeg/macos`,
      { recursive: true },
      () => null
    ),
    fs.mkdir(
      `${extraResourcesDir}/ffmpeg/linux`,
      { recursive: true },
      () => null
    ),
  ]);

  await Promise.all([
    downloadFile(
      "https://github.com/yt-dlp/yt-dlp/releases/download/2022.04.08/yt-dlp",
      `${extraResourcesDir}/ytdlp/yt-dlp`
    ),
    downloadFile(
      "https://github.com/yt-dlp/yt-dlp/releases/download/2022.04.08/yt-dlp.exe",
      `${extraResourcesDir}/ytdlp/yt-dlp.exe`
    ),
    downloadFile(
      "https://github.com/yt-dlp/yt-dlp/releases/download/2022.04.08/yt-dlp_macos",
      `${extraResourcesDir}/ytdlp/yt-dlp_macos`
    ),
    downloadFile(
      "https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-full.7z",
      `${tmpDir}/ffmpeg/win/ffmpeg.7z`
    ),
    downloadFile(
      "https://evermeet.cx/ffmpeg/ffmpeg-5.0.1.zip",
      `${tmpDir}/ffmpeg/macos/ffmpeg.zip`
    ),
    downloadFile(
      "https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz",
      `${tmpDir}/ffmpeg/linux/ffmpeg.tar.xz`
    ),
  ]);

  const getWinFfmpeg = async () => {
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
          }
        );
      }
    );
  };
  const getMacosFfmpeg = async () => {
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
          }
        );
      }
    );
  };
  const getLinuxFfmpeg = async () => {
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
              }
            );
          }
        );
      }
    );
  };
  await Promise.all([getLinuxFfmpeg(), getMacosFfmpeg(), getWinFfmpeg()]);
}

await getExternalResources();
