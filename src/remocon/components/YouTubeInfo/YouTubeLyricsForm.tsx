import React from "react";

import * as styles from "./YouTubeInfo.module.scss";
import { YouTubeInfoVideoInfoQuery$data } from "./__generated__/YouTubeInfoVideoInfoQuery.graphql";

interface Props {
  videoInfo: YouTubeInfoVideoInfoQuery$data["youtubeVideoInfo"];
  onSelectCaption: (language: string | undefined) => void;
  onAdhocLyricsChanged: (lyrics: string | null) => void;
}

const YouTubeLyricsForm = ({
  videoInfo,
  onSelectCaption,
  onAdhocLyricsChanged,
}: Props) => {
  if (videoInfo.__typename !== "YoutubeVideoInfo") return null;

  return (
    <div className={styles.lyricsForm}>
      <h3>Lyrics</h3>
      <h4>From captions</h4>
      <select
        defaultValue={undefined}
        onChange={(e) => onSelectCaption(e.target.value)}
      >
        <option value={undefined}>None</option>
        {videoInfo.captionLanguages.map(({ code, name }) => (
          <option key={code} value={code}>
            {name}
          </option>
        ))}
      </select>
      <h4>Adhoc</h4>
      <textarea
        onChange={(e) => onAdhocLyricsChanged(e.target.value.trim() || null)}
        placeholder={
          "Paste lyrics here.\n" +
          "Empty lines will be filtered out.\n" +
          "Lyrics can be added line by line onto the screen while the song is playing."
        }
      />
    </div>
  );
};

export default YouTubeLyricsForm;
