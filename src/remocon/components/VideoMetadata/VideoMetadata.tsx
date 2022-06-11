import React from "react";
// tslint:disable-next-line:no-submodule-imports
import { BsClockFill, BsEyeFill } from "react-icons/bs";

import styles from "./VideoMetadata.module.scss";

interface Props {
  videoSource: "youtube" | "niconico";
  videoInfo: {
    author: string;
    channelId: string;
    lengthSeconds: number;
    title: string;
    viewCount: number;
  };
}

const VideoMetadata = ({ videoSource, videoInfo }: Props) => {
  const channelUrl =
    videoSource === "youtube"
      ? `https://www.youtube.com/channel/${videoInfo.channelId}`
      : `https://www.nicovideo.jp/user/${videoInfo.channelId}`;

  return (
    <div>
      <a className={styles.channel} href={channelUrl}>
        {videoInfo.author}
      </a>
      <div className={styles.title}>{videoInfo.title}</div>
      <div className={styles.numbers}>
        <span>
          <BsEyeFill /> {videoInfo.viewCount}
        </span>
        <span>
          <BsClockFill /> {videoInfo.lengthSeconds}
        </span>
      </div>
    </div>
  );
};

export default VideoMetadata;
