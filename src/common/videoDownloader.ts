import { spawn } from "child_process";
import { app } from "electron"; // tslint:disable-line:no-implicit-dependencies
import fs from "fs";
import process from "process";

import invariant from "ts-invariant";

import { JoysoundQueueItem } from "../main/graphql";
import { JoysoundAPI } from "../main/joysoundApi";

import { getSongDuration } from "./joysoundParser";

export const TEMP_FOLDER: string = `${app.getPath("temp")}/karafriends_tmp`;
const captionCodeRe: RegExp = new RegExp(/^[a-z]{2}$/);

const extraResourcesPath: string =
  process.env.NODE_ENV === "development"
    ? `${app.getAppPath()}/../../../extraResources/`
    : `${process.resourcesPath}/extraResources/`;

interface ResourcePaths {
  // Path to the directory containing the ffmpeg executable
  ffmpeg: string;
  // Path to the ytdlp executable
  ytdlp: string;
}

const linuxResourcePaths: ResourcePaths = {
  ffmpeg: `${extraResourcesPath}ffmpeg/linux/ffmpeg`,
  ytdlp: `${extraResourcesPath}/ytdlp/yt-dlp`,
};

const macosResourcePaths: ResourcePaths = {
  ffmpeg: `${extraResourcesPath}ffmpeg/macos/ffmpeg`,
  ytdlp: `${extraResourcesPath}ytdlp/yt-dlp_macos`,
};

const winResourcePaths: ResourcePaths = {
  ffmpeg: `${extraResourcesPath}ffmpeg/win/ffmpeg.exe`,
  ytdlp: `${extraResourcesPath}ytdlp/yt-dlp.exe`,
};

const resourcePaths: ResourcePaths =
  process.platform === "win32"
    ? winResourcePaths
    : process.platform === "darwin"
    ? macosResourcePaths
    : linuxResourcePaths;

export function downloadDamVideo(
  m3u8Url: string,
  songId: string,
  suffix: string
): void {
  if (!fs.existsSync(TEMP_FOLDER)) {
    fs.mkdirSync(TEMP_FOLDER);
  }

  const filename = `${TEMP_FOLDER}/${songId}-${suffix}.mp4`;
  const tempFilename = `${filename}.tmp`;

  if (fs.existsSync(filename)) {
    console.info(`${filename} already exists, not redownloading`);
    return;
  }

  console.info(`Downloading DAM video to ${filename}`);

  const ffmpegLogFilename = `${TEMP_FOLDER}/dam-${songId}.log`;
  const ffmpegLogStream = fs.createWriteStream(ffmpegLogFilename);

  const ffmpeg = spawn(
    resourcePaths.ffmpeg,
    [
      "-y",
      "-i",
      "m3u8Url",
      "-c",
      "copy",
      "-movflags",
      "faststart",
      "-f",
      "mp4",
      tempFilename,
    ],
    { stdio: ["ignore", "pipe", "pipe"] }
  );

  invariant(ffmpeg.stdout);
  invariant(ffmpeg.stderr);
  ffmpeg.stdout.pipe(ffmpegLogStream);
  ffmpeg.stderr.pipe(ffmpegLogStream);

  ffmpeg.on("exit", (code, signal) => {
    if (code === 0) {
      fs.renameSync(tempFilename, filename);
    } else {
      console.error(
        `Error downloading DAM video with ID ${songId}: code=${code}, signal=${signal}, log=${ffmpegLogFilename}`
      );
    }
  });
}

export function downloadJoysoundData(
  joysoundApi: JoysoundAPI,
  queueItem: JoysoundQueueItem,
  pushSongToQueue: (queueItem: JoysoundQueueItem) => any
): void {
  if (!fs.existsSync(TEMP_FOLDER)) {
    fs.mkdirSync(TEMP_FOLDER);
  }

  const songId = queueItem.songId;
  let finalQueueItem: JoysoundQueueItem = queueItem;

  const videoFilenameSuffix = queueItem.youtubeVideoId
    ? queueItem.youtubeVideoId
    : "default";

  const telopFilename = `${TEMP_FOLDER}/joysound-${songId}.joy_02`;
  const oggFilename = `${TEMP_FOLDER}/joysound-${songId}.ogg`;
  const videoFilename = `${TEMP_FOLDER}/joysound-${songId}-${videoFilenameSuffix}.mp4`;
  const ffmpegLogFilename = `${TEMP_FOLDER}/joyosund-${songId}.log`;

  const ffmpegLogStream = fs.createWriteStream(ffmpegLogFilename);

  const tempFilename = `${videoFilename}.tmp`;

  if (fs.existsSync(videoFilename)) {
    console.info(`${videoFilename} already exists, not redownloading`);

    if (!fs.existsSync(telopFilename)) {
      console.error(
        `${videoFilename} already exists, but ${telopFilename} does not.`
      );

      return;
    }

    const telopBuffer = fs.readFileSync(telopFilename);

    finalQueueItem = {
      ...finalQueueItem,
      playtime: getSongDuration(telopBuffer.buffer),
    };

    pushSongToQueue(finalQueueItem);
    return;
  } else if (fs.existsSync(tempFilename)) {
    console.error(`${videoFilename} was already queued, not redownloading`);

    return;
  }

  fs.closeSync(fs.openSync(tempFilename, "w"));

  const songDataPromise = joysoundApi.getSongRawData(songId);
  let videoDataPromise;

  if (queueItem.youtubeVideoId) {
    videoDataPromise = new Promise((resolve, reject) => {
      const ytdlpLogFilename = `${TEMP_FOLDER}/yt-${queueItem.youtubeVideoId}.log`;
      const ytdlpLogStream = fs.createWriteStream(ytdlpLogFilename);

      const ytdlp = spawn(
        resourcePaths.ytdlp,
        [
          "-S",
          "res:720,ext:mp4",
          "-f",
          "bv",
          "--recode",
          "mp4",
          "-N",
          "4",
          "--ffmpeg-location",
          resourcePaths.ffmpeg,
          "-o",
          videoFilename,
          "--",
          queueItem.youtubeVideoId!,
        ],
        { stdio: ["ignore", "pipe", "pipe"] }
      );

      invariant(ytdlp.stdout);
      invariant(ytdlp.stderr);
      ytdlp.stdout.pipe(ytdlpLogStream);
      ytdlp.stderr.pipe(ytdlpLogStream);

      ytdlp.on("exit", (code, signal) => {
        if (code === 0) {
          fs.unlinkSync(tempFilename);
          fs.renameSync(videoFilename, tempFilename);

          resolve(code);
        } else {
          console.error(
            `Error downloading Youtube Video with ID ${queueItem.youtubeVideoId}: code=${code}, signal=${signal}, log=${ytdlpLogFilename}`
          );
          reject(code);
        }
      });
    });
  } else {
    videoDataPromise = joysoundApi.getMovieUrls(songId).then((data) => {
      const url = data.movie.mov1;

      return new Promise((resolve, reject) => {
        const ffmpeg = spawn(
          resourcePaths.ffmpeg,
          [
            "-y",
            "-i",
            url,
            "-c",
            "copy",
            "-movflags",
            "faststart",
            "-f",
            "mp4",
            tempFilename,
          ],
          { stdio: ["ignore", "pipe", "pipe"] }
        );

        invariant(ffmpeg.stdout);
        invariant(ffmpeg.stderr);
        ffmpeg.stdout.pipe(ffmpegLogStream);
        ffmpeg.stderr.pipe(ffmpegLogStream);

        ffmpeg.on("exit", (code, signal) => {
          if (code === 0) {
            resolve(code);
          } else {
            console.error(
              `Error downloading Joysound video with ID ${songId}: url=${url}, code=${code}, signal=${signal}, log=${ffmpegLogFilename}`
            );

            reject(code);
          }
        });
      });
    });
  }

  console.info(`Downloading Joysound video to ${videoFilename}`);

  Promise.all([videoDataPromise, songDataPromise]).then((values) => {
    const joysoundSongRawData = values[1];

    const telopBase64 = joysoundSongRawData.telop;
    const oggBase64 = joysoundSongRawData.ogg;

    const telopBuffer = Buffer.from(
      telopBase64.slice(30) + telopBase64.slice(0, 30),
      "base64"
    );
    const oggBuffer = Buffer.from(
      oggBase64.slice(30) + oggBase64.slice(0, 30),
      "base64"
    );

    if (!fs.existsSync(telopFilename)) {
      fs.writeFileSync(telopFilename, telopBuffer);
    }

    const ffmpeg = spawn(
      resourcePaths.ffmpeg,
      [
        "-stream_loop",
        "-1",
        "-i",
        tempFilename,
        "-i",
        "-",
        "-c",
        "copy",
        "-shortest",
        "-movflags",
        "faststart",
        "-f",
        "mp4",
        videoFilename,
      ],
      { stdio: ["pipe", "pipe", "pipe"] }
    );

    invariant(ffmpeg.stdout);
    invariant(ffmpeg.stderr);
    ffmpeg.stdout.pipe(ffmpegLogStream);
    ffmpeg.stderr.pipe(ffmpegLogStream);

    ffmpeg.on("exit", (code, signal) => {
      if (code === 0) {
        fs.unlinkSync(tempFilename);

        finalQueueItem = {
          ...finalQueueItem,
          playtime: getSongDuration(telopBuffer.buffer),
        };

        pushSongToQueue(finalQueueItem);
      } else {
        console.error(
          `Error downloading Joysound video with ID ${songId}: code=${code}, signal=${signal}, log=${ffmpegLogFilename}`
        );
      }
    });

    invariant(ffmpeg.stdin);

    ffmpeg.stdin.write(oggBuffer);
    ffmpeg.stdin.end();
  });
}

export function downloadYoutubeVideo(
  videoId: string,
  captionCode: string | null,
  onComplete: () => any
): void {
  if (captionCode !== null && !captionCodeRe.test(captionCode)) {
    console.error(
      `Error downloading Youtube Video. ${captionCode} is not a valid caption code`
    );
    return;
  }

  if (!fs.existsSync(TEMP_FOLDER)) {
    fs.mkdirSync(TEMP_FOLDER);
  }

  const writeBasePath = `${TEMP_FOLDER}/${videoId}`;
  console.info(`Downloading YouTube video to ${writeBasePath}.mp4`);

  const ytdlpLogFilename = `${TEMP_FOLDER}/yt-${videoId}.log`;
  const ytdlpLogStream = fs.createWriteStream(ytdlpLogFilename);

  const captionArgs = captionCode
    ? ["--write-subs", "--sub-langs", captionCode]
    : [];

  const ytdlp = spawn(
    resourcePaths.ytdlp,
    [
      ...captionArgs,
      "-S",
      "res:720,ext:mp4:m4a",
      "--recode",
      "mp4",
      "-N",
      "4",
      "--ffmpeg-location",
      resourcePaths.ffmpeg,
      "-o",
      `${writeBasePath}.mp4`,
      "--",
      videoId,
    ],
    { stdio: ["ignore", "pipe", "pipe"] }
  );

  invariant(ytdlp.stdout);
  invariant(ytdlp.stderr);
  ytdlp.stdout.pipe(ytdlpLogStream);
  ytdlp.stderr.pipe(ytdlpLogStream);

  ytdlp.on("exit", (code, signal) => {
    if (code !== 0) {
      console.error(
        `Error downloading Youtube Video with ID ${videoId}: code=${code}, signal=${signal}, log=${ytdlpLogFilename}`
      );
      return;
    }

    if (captionCode) {
      try {
        fs.renameSync(
          `${writeBasePath}.${captionCode}.vtt`,
          `${writeBasePath}.vtt`
        );
      } catch (fsError) {
        console.error(
          `Error trying to rename caption file ${writeBasePath}.${captionCode}.vtt to ${writeBasePath}.vtt: ${fsError}`
        );
      }
    }
    onComplete();
  });
}

export function downloadNicoVideo(
  videoId: string,
  onComplete: () => any
): void {
  if (!fs.existsSync(TEMP_FOLDER)) {
    fs.mkdirSync(TEMP_FOLDER);
  }

  const writeBasePath = `${TEMP_FOLDER}/${videoId}`;
  console.info(`Downloading Niconico video to ${writeBasePath}.mp4`);

  const ytdlpLogFilename = `${TEMP_FOLDER}/nico-${videoId}.log`;
  const ytdlpLogStream = fs.createWriteStream(ytdlpLogFilename);

  const ytdlp = spawn(
    resourcePaths.ytdlp,
    [
      "-N",
      "4",
      "-o",
      `${writeBasePath}.mp4`,
      "--",
      `https://www.nicovideo.jp/watch/${videoId}`,
    ],
    { stdio: ["ignore", "pipe", "pipe"] }
  );

  invariant(ytdlp.stdout);
  invariant(ytdlp.stderr);
  ytdlp.stdout.pipe(ytdlpLogStream);
  ytdlp.stderr.pipe(ytdlpLogStream);

  ytdlp.on("exit", (code, signal) => {
    if (code !== 0) {
      console.error(
        `Error downloading Niconico Video with ID ${videoId}: code=${code}, signal=${signal}, log=${ytdlpLogFilename}`
      );
      return;
    }

    onComplete();
  });
}
