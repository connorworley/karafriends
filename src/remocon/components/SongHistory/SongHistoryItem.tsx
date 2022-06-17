import React from "react";
import { Link } from "react-router-dom";

import { ListItem } from "../List";
import WeebText from "../WeebText";
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
      <ListItem>
        <div>
          <WeebText bold text={song.name} yomi={song.nameYomi} />
        </div>
        <div>
          <WeebText text={song.artistName} yomi={song.artistNameYomi} />
          <span className={styles.date}>{date.toLocaleString()}</span>
        </div>
      </ListItem>
    </Link>
  );
};

export default SongHistoryItem;
