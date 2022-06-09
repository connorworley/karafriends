import React from "react";
import { Link } from "react-router-dom";
import { isRomaji, toRomaji } from "wanakana";

import styles from "./SongHistory.module.scss";
import { SongHistory_history } from "./__generated__/SongHistory_history.graphql";

type Props = SongHistory_history["history"]["edges"][0]["node"];

const SongHistoryItem = ({ song, playDate }: Props) => {
  const [year, month, day, hour, minute, second] = playDate
    .match(/(....)(..)(..)(..)(..)(..)/)!
    .slice(1);
  const date = new Date(
    `${year}-${month}-${day}T${hour}:${minute}:${second}.000+09:00`
  );
  return (
    <Link to={`/song/${song.id}`}>
      <div className={styles.listItem}>
        <div>
          <span className={styles.title}>{song.name}</span>
          {isRomaji(song.name) ? null : (
            <span className={styles.romaji}> {toRomaji(song.nameYomi)}</span>
          )}
        </div>
        <div>
          <span>{song.artistName}</span>
          {isRomaji(song.artistName) ? null : (
            <span className={styles.romaji}>
              {" "}
              {toRomaji(song.artistNameYomi)}
            </span>
          )}
          <span className={styles.date}>{date.toLocaleString()}</span>
        </div>
      </div>
    </Link>
  );
};

export default SongHistoryItem;
