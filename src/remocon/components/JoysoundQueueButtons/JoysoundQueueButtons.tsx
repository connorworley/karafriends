import React, { useEffect, useState } from "react";

import useNickname from "../../hooks/useNickname";
import { JoysoundSongPageQuery$data } from "../../pages/__generated__/JoysoundSongPageQuery.graphql";
import JoysoundQueueButton from "./JoysoundQueueButton";
import styles from "./JoysoundQueueButtons.module.scss";

interface Props {
  song: JoysoundSongPageQuery$data["joysoundSongDetail"];
}

const JoysoundQueueButtons = ({ song }: Props) => {
  const nickname = useNickname();
  const [isDisabled, setIsDisabled] = useState(false);

  return (
    <div className={styles.container}>
      <JoysoundQueueButton
        song={song}
        nickname={nickname}
        isRomaji={false}
        isDisabled={isDisabled}
        setDisabled={() => setIsDisabled(true)}
      />

      <JoysoundQueueButton
        song={song}
        nickname={nickname}
        isRomaji={true}
        isDisabled={isDisabled}
        setDisabled={() => setIsDisabled(true)}
      />
    </div>
  );
};

export default JoysoundQueueButtons;
