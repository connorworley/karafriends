import { exec } from "child_process";
import { app } from "electron"; // tslint:disable-line:no-implicit-dependencies
import fs from "fs";
import process from "process";

export const TEMP_FOLDER: string = `${app.getPath("temp")}/karafriends_tmp`;
const youtubeIdRe: RegExp = new RegExp(/^[0-9A-Za-z_-]{10}[048AEIMQUYcgkosw]$/);
const captionCodeRe: RegExp = new RegExp(/^[a-z]{2}$/);
const extraResourcesPath: string =
  process.env.NODE_ENV === "development"
    ? `${app.getAppPath()}/extraResources/`
    : `${process.resourcesPath}/extraResources/`;

interface YtdlResourcePaths {
  // Path to the directory containing the ffmpeg executable
  ffmpeg: string;
  // Path to the ytdlp executable
  ytdlp: string;
}

const linuxResourcePaths: YtdlResourcePaths = {
  ffmpeg: `${extraResourcesPath}/ffmpeg/linux/`,
  ytdlp: `${extraResourcesPath}/ytdlp/yt-dlp`,
};

const macosResourcePaths: YtdlResourcePaths = {
  ffmpeg: `${extraResourcesPath}/ffmpeg/macos/`,
  ytdlp: `${extraResourcesPath}/ytdlp/yt-dlp_macos`,
};

const winResourcePaths: YtdlResourcePaths = {
  ffmpeg: `${extraResourcesPath}/ffmpeg/win/`,
  ytdlp: `${extraResourcesPath}/ytdlp/yt-dlp.exe`,
};

const resourcePaths: YtdlResourcePaths =
  process.platform === "win32"
    ? winResourcePaths
    : process.platform === "darwin"
    ? macosResourcePaths
    : linuxResourcePaths;

export function downloadYoutubeVideo(
  videoId: string,
  captionCode: string | null,
  onComplete: () => any
): void {
  // Make our inputs are valid. Don't want to pass just anything into a raw shell command
  if (!youtubeIdRe.test(videoId)) {
    console.error(
      `Error downloading Youtube Video. ${videoId} is not a valid YouTube video ID`
    );
    return;
  }
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
  const captionArgs = captionCode
    ? `--write-subs --sub-langs ${captionCode}`
    : "";
  exec(
    `${resourcePaths.ytdlp} ${captionArgs} -S res,ext:mp4:m4a --recode mp4 -N 4 --ffmpeg-location "${resourcePaths.ffmpeg}" -o "${writeBasePath}.mp4" -- "${videoId}"`,
    (error, stdout, stderr) => {
      if (error) {
        console.error(
          `Error downloading Youtube Video with ID ${videoId}: ${error}`
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
      console.log(stdout);
      console.error(stderr);
      onComplete();
    }
  );
}
