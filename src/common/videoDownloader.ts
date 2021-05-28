import fs from "fs";
import ytdl from "ytdl-core";

export function downloadYoutubeVideo(
  videoId: string,
  onComplete: () => any
): void {
  const writePath = `vids/${videoId}.mp4`;
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
