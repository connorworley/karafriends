import classnames from "classnames";
import React from "react";
// tslint:disable-next-line:no-submodule-imports
import { MdPause, MdPlayArrow, MdReplay, MdSkipNext } from "react-icons/md";

import usePlaybackState from "../../../common/hooks/usePlaybackState";
import styles from "./PlaybackControls.module.scss";

const PlaybackControls = () => {
  const { playbackState, setPlaybackState } = usePlaybackState();
  const disabled = !["PLAYING", "PAUSED"].includes(playbackState);

  return (
    <div
      className={classnames(styles.controls, { [styles.disabled]: disabled })}
    >
      <div onClick={() => setPlaybackState("RESTARTING")}>
        <MdReplay />
      </div>
      <div
        className={styles.playPause}
        onClick={() =>
          setPlaybackState(playbackState === "PAUSED" ? "PLAYING" : "PAUSED")
        }
      >
        {playbackState === "PLAYING" ? <MdPause /> : <MdPlayArrow />}
      </div>
      <div onClick={() => setPlaybackState("SKIPPING")}>
        <MdSkipNext />
      </div>
    </div>
  );
};

export default PlaybackControls;
