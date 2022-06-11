import React from "react";
// tslint:disable-next-line:no-submodule-imports
import { BsClockFill, BsEyeFill } from "react-icons/bs";

import styles from "./YouTubeInfo.module.scss";
import { YouTubeInfoVideoInfoQueryResponse } from "./__generated__/YouTubeInfoVideoInfoQuery.graphql";

interface Props {
  videoInfo: YouTubeInfoVideoInfoQueryResponse["youtubeVideoInfo"];
}

const YouTubeMetadata = ({ videoInfo }: Props) => {
  if (videoInfo.__typename !== "YoutubeVideoInfo") return null;
  return (
    <div className={styles.metadata}>
      <div className={styles.channel}>
        <a href={`https://www.youtube.com/channel/${videoInfo.channelId}`}>
          {videoInfo.author}
        </a>
      </div>
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

export default YouTubeMetadata;
