import React, { useState } from "react";
// tslint:disable-next-line:no-submodule-imports
import { BsMusicNoteBeamed } from "react-icons/bs";
// tslint:disable-next-line:no-submodule-imports
import { FaAngleDown, FaAngleUp } from "react-icons/fa";

import PlaybackControls from "../PlaybackControls";
import SongQueue from "../SongQueue";
import styles from "./ControlBar.module.scss";

const ControlBar = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={styles.controlBar}>
      <div className={styles.nowPlaying}>
        <BsMusicNoteBeamed />
        <div onClick={() => setExpanded(!expanded)}>
          {expanded ? <FaAngleDown /> : <FaAngleUp />}
        </div>
      </div>
      {expanded && (
        <>
          <div className={styles.queue}>
            <SongQueue />
          </div>
          <div className={styles.controls}>
            <PlaybackControls />
          </div>
        </>
      )}
    </div>
  );
};

export default ControlBar;
