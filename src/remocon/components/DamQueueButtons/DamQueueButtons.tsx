import React, { useEffect, useState } from "react";

import {
  SongPageQueryResponse,
  VocalType,
} from "../../pages/__generated__/SongPageQuery.graphql";
import DamQueueButton from "./DamQueueButton";
import styles from "./DamQueueButtons.module.scss";

interface Props {
  song: SongPageQueryResponse["songById"];
}

const DamQueueButtons = ({ song }: Props) => {
  const [nickname, setNickname] = useState("Unknown");

  useEffect(() => {
    const maybeNickname = localStorage.getItem("nickname");
    if (maybeNickname) setNickname(maybeNickname);
  }, []);

  return (
    <div className={styles.container}>
      {song.vocalTypes.map((vocalType, i) => (
        <DamQueueButton
          key={vocalType}
          song={song}
          streamingUrlIndex={i}
          nickname={nickname}
        />
      ))}
    </div>
  );
};

export default DamQueueButtons;
