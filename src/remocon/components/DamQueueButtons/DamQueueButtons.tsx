import React, { useEffect, useState } from "react";

import useNickname from "../../hooks/useNickname";
import {
  SongPageQuery$data,
  VocalType,
} from "../../pages/__generated__/SongPageQuery.graphql";
import DamQueueButton from "./DamQueueButton";
import styles from "./DamQueueButtons.module.scss";

interface Props {
  song: SongPageQuery$data["songById"];
}

const DamQueueButtons = ({ song }: Props) => {
  const nickname = useNickname();

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
