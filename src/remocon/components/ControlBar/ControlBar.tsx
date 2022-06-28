import React, { useState } from "react";
// tslint:disable-next-line:no-submodule-imports
import { BsMusicPlayerFill } from "react-icons/bs";
// tslint:disable-next-line:no-submodule-imports
import { FaAngleDown, FaAngleUp, FaSmile } from "react-icons/fa";

import EmoteButtons from "../EmoteButtons";
import PlaybackControls from "../PlaybackControls";
import SongQueue from "../SongQueue";
import styles from "./ControlBar.module.scss";
import NowPlaying from "./NowPlaying";

const ControlBar = () => {
  const [expanded, _setExpanded] = useState(
    localStorage.getItem("expanded") === "true" || false
  );
  const [showEmotes, _setShowEmotes] = useState(
    localStorage.getItem("showEmotes") === "true" || false
  );

  const setExpanded = (value: boolean) => {
    localStorage.setItem("expanded", value.toString());
    _setExpanded(value);
  };

  const setShowEmotes = (value: boolean) => {
    localStorage.setItem("showEmotes", value.toString());
    _setShowEmotes(value);
  };

  return (
    <div className={styles.controlBar}>
      <div className={styles.expander}>
        <NowPlaying />
        <div onClick={() => setExpanded(!expanded)}>
          {expanded ? <FaAngleDown /> : <FaAngleUp />}
        </div>
      </div>
      {expanded && (
        <>
          <div className={styles.queue}>
            <SongQueue />
          </div>
          <div
            className={styles.toggle}
            onClick={() => setShowEmotes(!showEmotes)}
          >
            {showEmotes ? <BsMusicPlayerFill /> : <FaSmile />}
          </div>
          <div className={styles.controls}>
            {showEmotes ? <EmoteButtons /> : <PlaybackControls />}
          </div>
        </>
      )}
    </div>
  );
};

export default ControlBar;
