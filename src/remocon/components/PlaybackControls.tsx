import React from "react";
import usePlaybackState from "../../common/hooks/usePlaybackState";

const PlaybackControls = () => {
  const { playbackState, setPlaybackState } = usePlaybackState();
  const disabled = !["PLAYING", "PAUSED"].includes(playbackState);

  return (
    <div className="center">
      <a
        className={`btn-floating btn-medium red ${disabled ? "disabled" : ""}`}
        onClick={() => setPlaybackState("RESTARTING")}
      >
        <i className="medium material-icons">replay</i>
      </a>
      <a
        className={`btn-floating btn-large red ${disabled ? "disabled" : ""}`}
        onClick={() =>
          setPlaybackState(playbackState === "PAUSED" ? "PLAYING" : "PAUSED")
        }
      >
        <i className="large material-icons">
          {playbackState === "PLAYING" ? "pause" : "play_arrow"}
        </i>
      </a>
      <a
        className={`btn-floating btn-medium red ${disabled ? "disabled" : ""}`}
        onClick={() => setPlaybackState("SKIPPING")}
      >
        <i className="medium material-icons">skip_next</i>
      </a>
    </div>
  );
};

export default PlaybackControls;
