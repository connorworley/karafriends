import React from "react";
// tslint:disable-next-line:no-submodule-imports
import { BsClockFill, BsEyeFill } from "react-icons/bs";

import styles from "./NiconicoInfo.module.scss";
import { NiconicoInfoVideoInfoQueryResponse } from "./__generated__/NiconicoInfoVideoInfoQuery.graphql";

interface Props {
  videoInfo: NiconicoInfoVideoInfoQueryResponse["nicoVideoInfo"];
}

const NiconicoMetadata = ({ videoInfo }: Props) => {
  if (videoInfo.__typename !== "NicoVideoInfo") return null;
  return (
    <div className={styles.metadata}>
      <div className={styles.channel}>
        <a href={`https://www.nicovideo.jp/user/${videoInfo.channelId}`}>
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

export default NiconicoMetadata;
