import React, { useEffect, useState } from "react";

import useUserIdentity from "../../hooks/useUserIdentity";
import { JoysoundSongPageQuery$data } from "../../pages/__generated__/JoysoundSongPageQuery.graphql";
import JoysoundQueueButton from "./JoysoundQueueButton";
import styles from "./JoysoundQueueButtons.module.scss";

interface Props {
  song: JoysoundSongPageQuery$data["joysoundSongDetail"];
  youtubeVideoId: string | null;
}

const JoysoundQueueButtons = ({ song, youtubeVideoId }: Props) => {
  const userIdentity = useUserIdentity();
  const [isDisabled, setIsDisabled] = useState(false);

  return (
    <div className={styles.container}>
      <JoysoundQueueButton
        song={song}
        youtubeVideoId={youtubeVideoId}
        userIdentity={userIdentity}
        isRomaji={false}
        isDisabled={isDisabled}
        setDisabled={setIsDisabled}
      />

      <JoysoundQueueButton
        song={song}
        youtubeVideoId={youtubeVideoId}
        userIdentity={userIdentity}
        isRomaji={true}
        isDisabled={isDisabled}
        setDisabled={setIsDisabled}
      />
    </div>
  );
};

export default JoysoundQueueButtons;
