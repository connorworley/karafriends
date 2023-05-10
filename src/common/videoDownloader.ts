import { spawn } from "child_process";
import { app } from "electron"; // tslint:disable-line:no-implicit-dependencies
import fs from "fs";
import process from "process";

import invariant from "ts-invariant";

import { DownloadQueueItem, JoysoundQueueItem } from "../main/graphql";
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

function deleteTempFiles(prefix: string): void {
  for (const filename of fs.readdirSync(TEMP_FOLDER)) {
    if (!filename) {
      continue;
    }

    if (filename.includes(prefix)) {
      fs.unlinkSync(filename);
    }
  }
}

function handleFFmpegDownloadLog(
  log: string,
  songFrames: number,
  downloadQueue: DownloadQueueItem[],
  downloadType: number,
  songId: string,
  suffix: string | null = null,
): void {
  const frameMatchData = log.match(/frame=\s*(\d+)\s*/);

  if (frameMatchData) {
    const rawProgress = parseInt(frameMatchData[1], 10) / songFrames;
    const progress = Math.min(rawProgress, 1.0);

    updateVideoDownloadProgress(
      progress,
      downloadQueue,
      downloadType,
      songId,
      suffix,
    );
  }
};

function handleYoutubeDownloadLog(
  log: string,
  downloadQueue: DownloadQueueItem[],
  downloadType: number,
  songId: string,
  suffix: string | null = null,
): void {
  const matchData = log.match(/\[download\]\s*(\d+\.\d)%/);

  if (matchData) {
    const progress = Math.min(parseFloat(matchData[1]) / 100.0, 1.0);

    updateVideoDownloadProgress(
      progress,
      downloadQueue,
      downloadType,
      songId,
      suffix,
    );
  }
}

function isVideoCurrentlyDownloading(
  filename: string,
  downloadQueue: DownloadQueueItem[],
  downloadType: number,
  songId: string,
  suffix: string | null = null,
): boolean {
  if (!fs.existsSync(filename)) {
    return false;
  }

  const prevDownloadQueueItem = downloadQueue.find(
    (item) => item.downloadType === downloadType && item.songId === songId && item.suffix === suffix
  );

  return Boolean(prevDownloadQueueItem);
}

export function getVideoDownloadProgress(
  downloadQueue: DownloadQueueItem[],
  downloadType: number,
  songId: string,
  suffix: string | null = null
): number {
  const downloadQueueItem = downloadQueue.find(
    (item) => item.downloadType === downloadType && item.songId === songId && item.suffix === suffix
  );

  if (downloadQueueItem) {
    return downloadQueueItem.progress;
  }

  return -1.0;
}

function updateVideoDownloadProgress(
  progress: number,
  downloadQueue: DownloadQueueItem[],
  downloadType: number,
  songId: string,
  suffix: string | null = null,
): void {
  const downloadQueueItem = downloadQueue.find(
    (item) => item.downloadType === downloadType && item.songId === songId && item.suffix === suffix
  );

  if (downloadQueueItem) {
    downloadQueueItem.progress = Math.max(downloadQueueItem.progress, progress);
  }
}

function removeVideoDownloadFromQueue(
  downloadQueue: DownloadQueueItem[],
  downloadType: number,
  songId: string,
  suffix: string | null = null,
): void {
  const index = downloadQueue.findIndex(
    (item) => item.downloadType === downloadType && item.songId === songId && item.suffix === suffix
  );

  if (index >= 0) {
    downloadQueue.splice(index, 1);
  }
}

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
  downloadQueue: DownloadQueueItem[],
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

  const filenamePrefix = `joysound-${songId}`;
  const writeBasePath = `${TEMP_FOLDER}/${filenamePrefix}`;

  const telopFilename = `${writeBasePath}.joy_02`;
  const oggFilename = `${writeBasePath}.ogg`;
  const videoFilename = `${writeBasePath}-${videoFilenameSuffix}.mp4`;
  const ffmpegLogFilename = `${writeBasePath}.log`;

  const tempFilename = `${videoFilename}.tmp`;

  if (fs.existsSync(videoFilename)) {
    console.info(`${videoFilename} already exists, not redownloading`);

    if (fs.existsSync(telopFilename)) {
      const telopBuffer = fs.readFileSync(telopFilename);

      finalQueueItem = {
        ...finalQueueItem,
        playtime: getSongDuration(telopBuffer.buffer),
      };

      pushSongToQueue(finalQueueItem);
      return;
    } else {
      console.error(
        `${videoFilename} already exists, but ${telopFilename} does not.`
      );

      fs.unlinkSync(videoFilename);
    }
  } 

  if (isVideoCurrentlyDownloading(tempFilename, downloadQueue, 0, songId, queueItem.youtubeVideoId)) {
    console.error(`${videoFilename} was already queued, not redownloading`);
    
    return;
  } else if (fs.existsSync(tempFilename)) {
    console.error(`${tempFilename} exists but was not in the download queue.`);

    deleteTempFiles(filenamePrefix);
  }

  fs.closeSync(fs.openSync(tempFilename, "w"));

  const ffmpegLogStream = fs.createWriteStream(ffmpegLogFilename);

  const songDataPromise = joysoundApi.getSongRawData(songId);
  let videoDataPromise;

  const downloadQueueItem: DownloadQueueItem = {
    downloadType: 0,
    songId,
    suffix: queueItem.youtubeVideoId,
    progress: 0.0,
  };

  downloadQueue.push(downloadQueueItem);

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
          tempFilename + ".mp4",
          "--",
          queueItem.youtubeVideoId!,
        ],
        { stdio: ["ignore", "pipe", "pipe"] }
      );

      invariant(ytdlp.stdout);
      invariant(ytdlp.stderr);
      ytdlp.stdout.pipe(ytdlpLogStream);
      ytdlp.stderr.pipe(ytdlpLogStream);

      ytdlp.stdout.on("data", (data) => {
        handleYoutubeDownloadLog(
          data.toString(),
          downloadQueue,
          0,
          songId,
          queueItem.youtubeVideoId,
        )
      });

      ytdlp.on("exit", (code, signal) => {
        if (code === 0) {
          fs.unlinkSync(tempFilename);
          fs.renameSync(tempFilename + ".mp4", tempFilename);

          removeVideoDownloadFromQueue(downloadQueue, 0, songId, queueItem.youtubeVideoId);

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
        let songFrames = 0;

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

        ffmpeg.stderr.on("data", (ffmpegData) => {
          const ffmpegLog = ffmpegData.toString();

          const durationMatchData = ffmpegLog.match(
            /Duration:\s*(\d+):(\d+):(\d+)/
          );

          if (durationMatchData) {
            let songDuration = 0;

            songDuration += parseInt(durationMatchData[1], 10) * 3600;
            songDuration += parseInt(durationMatchData[2], 10) * 60;
            songDuration += parseInt(durationMatchData[3], 10);

            songFrames = songDuration * 30;
          }

          handleFFmpegDownloadLog(
            ffmpegLog,
            songFrames,
            downloadQueue,
            0,
            songId,
            queueItem.youtubeVideoId,
          );
        });

        ffmpeg.on("exit", (code, signal) => {
          if (code === 0) {
            removeVideoDownloadFromQueue(downloadQueue, 0, songId, queueItem.youtubeVideoId);

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
      fs.unlinkSync(tempFilename);
      
      if (code === 0) {
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
  downloadQueue: DownloadQueueItem[],
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

  const filenamePrefix = `yt-${videoId}`;
  const writeBasePath = `${TEMP_FOLDER}/${filenamePrefix}`;
  
  const videoFilename = `${writeBasePath}.mp4`;
  const vttFilename = `${writeBasePath}.vtt`;
  const ytdlpLogFilename = `${writeBasePath}.log`;
  
  const tempFilename = `${videoFilename}.tmp`;

  if (isVideoCurrentlyDownloading(tempFilename, downloadQueue, 1, videoId)) {
    console.error(`${videoFilename} was already queued, not redownloading`);
    
    return;
  } else if (fs.existsSync(tempFilename)) {
    console.error(`${tempFilename} exists but was not in the download queue.`);

    deleteTempFiles(filenamePrefix);
  }

  fs.closeSync(fs.openSync(tempFilename, "w"));

  const downloadQueueItem: DownloadQueueItem = {
    downloadType: 1,
    songId: videoId,
    suffix: null,
    progress: 0.0,
  };

  downloadQueue.push(downloadQueueItem);

  console.info(`Downloading YouTube video to ${videoFilename}`);

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
      `${videoFilename}`,
      "--",
      videoId,
    ],
    { stdio: ["ignore", "pipe", "pipe"] }
  );

  invariant(ytdlp.stdout);
  invariant(ytdlp.stderr);
  ytdlp.stdout.pipe(ytdlpLogStream);
  ytdlp.stderr.pipe(ytdlpLogStream);

  ytdlp.stdout.on("data", (data) => {
    handleYoutubeDownloadLog(data.toString(), downloadQueue, 1, videoId);
  });

  ytdlp.on("exit", (code, signal) => {
    removeVideoDownloadFromQueue(downloadQueue, 1, videoId);
    
    fs.unlinkSync(tempFilename);
    
    if (code !== 0) {
      console.error(
        `Error downloading Youtube Video with ID ${videoId}: code=${code}, signal=${signal}, log=${ytdlpLogFilename}`
      );
      return;
    }

    if (captionCode) {
      try {
        fs.renameSync(`${writeBasePath}.${captionCode}.vtt`, vttFilename);
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
  downloadQueue: DownloadQueueItem[],
  videoId: string,
  onComplete: () => any
): void {
  if (!fs.existsSync(TEMP_FOLDER)) {
    fs.mkdirSync(TEMP_FOLDER);
  }
  
  const filenamePrefix = `nico-${videoId}`;
  const writeBasePath = `${TEMP_FOLDER}/${filenamePrefix}`;
  
  const videoFilename = `${writeBasePath}.mp4`;
  const ytdlpLogFilename = `${writeBasePath}.log`;
  
  const tempFilename = `${videoFilename}.tmp`;

  if (isVideoCurrentlyDownloading(tempFilename, downloadQueue, 2, videoId)) {
    console.error(`${videoFilename} was already queued, not redownloading`);
    
    return;
  } else if (fs.existsSync(tempFilename)) {
    console.error(`${tempFilename} exists but was not in the download queue.`);

    deleteTempFiles(filenamePrefix);
  }

  fs.closeSync(fs.openSync(tempFilename, "w"));
  
  const downloadQueueItem: DownloadQueueItem = {
    downloadType: 2,
    songId: videoId,
    suffix: null,
    progress: 0.0,
  };

  downloadQueue.push(downloadQueueItem);
  
  console.info(`Downloading Niconico video to ${videoFilename}`);

  const ytdlpLogStream = fs.createWriteStream(ytdlpLogFilename);

  const ytdlp = spawn(
    resourcePaths.ytdlp,
    [
      "-N",
      "4",
      "-o",
      `${videoFilename}`,
      "--",
      `https://www.nicovideo.jp/watch/${videoId}`,
    ],
    { stdio: ["ignore", "pipe", "pipe"] }
  );

  invariant(ytdlp.stdout);
  invariant(ytdlp.stderr);
  ytdlp.stdout.pipe(ytdlpLogStream);
  ytdlp.stderr.pipe(ytdlpLogStream);

  ytdlp.stdout.on("data", (data) => {
    handleYoutubeDownloadLog(data.toString(), downloadQueue, 2, videoId);
  });

  ytdlp.on("exit", (code, signal) => {
    removeVideoDownloadFromQueue(downloadQueue, 2, videoId);

    fs.unlinkSync(tempFilename);
    
    if (code === 0) {
      onComplete();
    } else {
      console.error(
        `Error downloading Niconico Video with ID ${videoId}: code=${code}, signal=${signal}, log=${ytdlpLogFilename}`
      );
    }
  });
}
