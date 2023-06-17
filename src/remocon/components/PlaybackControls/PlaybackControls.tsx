import classnames from "classnames";
import React from "react";
// tslint:disable-next-line:no-submodule-imports
import { MdPause, MdPlayArrow, MdReplay, MdSkipNext } from "react-icons/md";

import usePlaybackState from "../../../common/hooks/usePlaybackState";
import useConfig from "../../hooks/useConfig";
import useUserIdentity from "../../hooks/useUserIdentity";
import PitchControls from "../PitchControls/PitchControls";
import * as styles from "./PlaybackControls.module.scss";

const PlaybackControls = () => {
  const { playbackState, setPlaybackState } = usePlaybackState();
  let disabled = !["PLAYING", "PAUSED"].includes(playbackState);

  const config = useConfig();
  const identity = useUserIdentity();

  if (config !== undefined && config.supervisedMode === true) {
    // XXX: Maybe we want to let the owner change pitch?
    disabled ||=
      !config.adminNicks.includes(identity.nickname) &&
      !config.adminDeviceIds.includes(identity.deviceId);
  }

  return (
    <>
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
      <PitchControls disabled={disabled} />
    </>
  );
};

export default PlaybackControls;
