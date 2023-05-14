import React, { useEffect, useState } from "react";

import useUserIdentity from "../../hooks/useUserIdentity";
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
  const userIdentity = useUserIdentity();

  return (
    <div className={styles.container}>
      {song.vocalTypes.map((vocalType, i) => (
        <DamQueueButton
          key={vocalType}
          song={song}
          streamingUrlIndex={i}
          userIdentity={userIdentity}
        />
      ))}
    </div>
  );
};

export default DamQueueButtons;
