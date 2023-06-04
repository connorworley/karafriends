import React, { useEffect, useState } from "react";

import useUserIdentity from "../../hooks/useUserIdentity";
import { JoysoundSongPageQuery$data } from "../../pages/__generated__/JoysoundSongPageQuery.graphql";
import JoysoundQueueButton from "./JoysoundQueueButton";
import * as styles from "./JoysoundQueueButtons.module.scss";

interface Props {
  song: JoysoundSongPageQuery$data["joysoundSongDetail"];
  youtubeVideoId: string | null;
  validatedYoutubeId: string | null;
}

const JoysoundQueueButtons = ({
  song,
  youtubeVideoId,
  validatedYoutubeId,
}: Props) => {
  const userIdentity = useUserIdentity();
  const [isDisabled, setIsDisabled] = useState(false);

  if (youtubeVideoId && !validatedYoutubeId) {
    return (
      <div className={styles.container}>
        <JoysoundQueueButton
          song={song}
          youtubeVideoId={youtubeVideoId}
          userIdentity={userIdentity}
          isRomaji={false}
          isDisabled={true}
          setDisabled={setIsDisabled}
        />

        <JoysoundQueueButton
          song={song}
          youtubeVideoId={youtubeVideoId}
          userIdentity={userIdentity}
          isRomaji={true}
          isDisabled={true}
          setDisabled={setIsDisabled}
        />
      </div>
    );
  } else {
    return (
      <div className={styles.container}>
        <JoysoundQueueButton
          song={song}
          youtubeVideoId={validatedYoutubeId}
          userIdentity={userIdentity}
          isRomaji={false}
          isDisabled={isDisabled}
          setDisabled={setIsDisabled}
        />

        <JoysoundQueueButton
          song={song}
          youtubeVideoId={validatedYoutubeId}
          userIdentity={userIdentity}
          isRomaji={true}
          isDisabled={isDisabled}
          setDisabled={setIsDisabled}
        />
      </div>
    );
  }
};

export default JoysoundQueueButtons;
