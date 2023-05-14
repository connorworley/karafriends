import React from "react";
import { Link } from "react-router-dom";
import { invariant } from "ts-invariant";

import { ListItem } from "../List";
import styles from "./SongHistory.module.scss";
import { SongHistory_songHistory$data } from "./__generated__/SongHistory_songHistory.graphql";

type Props = SongHistory_songHistory$data["songHistory"]["edges"][0]["node"];

function getSongLink(queueItemType: string, songId: string): string {
  switch (queueItemType) {
    case "DamQueueItem":
      return `/song/${songId}`;
    case "JoysoundQueueItem":
      return `/joysoundSong/${songId}`;
    case "YoutubeQueueItem":
      return `/search/youtube/${songId}`;
    case "NicoQueueItem":
      return `/search/niconico/${songId}`;
  }

  return `/song/${songId}`;
}

const SongHistoryItem = ({ song }: Props) => {
  invariant(song.__typename !== "%other");

  const songLink = getSongLink(song.__typename, song.songId);
  const date = new Date(parseInt(song.timestamp, 10));

  return (
    <Link to={songLink}>
      <ListItem>
        <div>
          <strong>{song.name}</strong>
          <span className={styles.date}>Queued by: {song.nickname}</span>
        </div>

        <div>
          {song.artistName}
          <span className={styles.date}>{date.toLocaleString()}</span>
        </div>
      </ListItem>
    </Link>
  );
};

export default SongHistoryItem;
