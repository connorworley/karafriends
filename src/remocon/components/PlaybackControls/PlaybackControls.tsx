import classnames from "classnames";
import React from "react";
// tslint:disable-next-line:no-submodule-imports
import { MdPause, MdPlayArrow, MdReplay, MdSkipNext } from "react-icons/md";

import usePlaybackState from "../../../common/hooks/usePlaybackState";
import useConfig from "../../hooks/useConfig";
import useNowPlaying from "../../hooks/useNowPlaying";
import useUserIdentity from "../../hooks/useUserIdentity";
import PitchControls from "../PitchControls/PitchControls";
import * as styles from "./PlaybackControls.module.scss";

const PlaybackControls = () => {
  const { playbackState, setPlaybackState } = usePlaybackState();
  const isPlaybackControllable = ["PLAYING", "PAUSED"].includes(playbackState);

  const config = useConfig();
  const currentSong = useNowPlaying();
  const identity = useUserIdentity();

  let isUserEntitled = true;
  if (config !== undefined && config.supervisedMode === true) {
    isUserEntitled =
      config.adminNicks.includes(identity.nickname) ||
      config.adminDeviceIds.includes(identity.deviceId) ||
      (currentSong !== undefined &&
        currentSong !== null &&
        currentSong.userIdentity !== undefined &&
        (currentSong.userIdentity.nickname === identity.nickname ||
          currentSong.userIdentity.deviceId === identity.deviceId));
  }

  const disabled = !isPlaybackControllable || !isUserEntitled;
  console.log(
    `isPlaybackControllable=${isPlaybackControllable}, isUserEntitled=${isUserEntitled}, disabled=${disabled}`
  );

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
