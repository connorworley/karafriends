import { app } from "electron"; // tslint:disable-line:no-implicit-dependencies
import fs from "fs";
import ytdl from "ytdl-core";

export const TEMP_FOLDER: string = `${app.getPath("temp")}/karafriends_tmp`;

export function downloadYoutubeVideo(
  videoId: string,
  onComplete: () => any
): void {
  if (!fs.existsSync(TEMP_FOLDER)) {
    fs.mkdirSync(TEMP_FOLDER);
  }
  const writePath = `${TEMP_FOLDER}/${videoId}.mp4`;
  if (fs.existsSync(writePath)) {
    onComplete();
    return;
  }

  const video = ytdl(videoId, {
    filter: (format) =>
      format.container === "mp4" && format.hasVideo && format.hasAudio,
    quality: "highestvideo",
  });
  video.on("end", onComplete);
  video.pipe(fs.createWriteStream(writePath));
}
