import React, { useEffect, useState } from "react";

import Button from "../Button";
import styles from "./JoysoundYoutubeButtons.module.scss";

interface Props {
  youtubeVideoId: string;
  detatchButtonOnClick: () => void;
}

const JoysoundYoutubeButtons = ({
  youtubeVideoId,
  detatchButtonOnClick,
}: Props) => {
  return (
    <div className={styles.container}>
      <Button type="submit">
        Attach Youtube Video (Currently Attached ID:{" "}
        {youtubeVideoId === "" ? "None" : youtubeVideoId})
      </Button>
      {youtubeVideoId !== "" && (
        <Button onClick={detatchButtonOnClick}>Detatch Youtube Video</Button>
      )}
    </div>
  );
};

export default JoysoundYoutubeButtons;
