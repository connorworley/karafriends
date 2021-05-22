import Hls from "hls.js";
import React, { useEffect, useRef, useState } from "react";
import { commitMutation, fetchQuery, graphql } from "react-relay";
import { PlayerPopSongMutation } from "./__generated__/PlayerPopSongMutation.graphql";

import environment from "../common/graphqlEnvironment";
import { InputDevice } from "./audioSystem";
import PianoRoll from "./PianoRoll";
import "./Player.css";

const popSongMutation = graphql`
  mutation PlayerPopSongMutation {
    popSong {
      song {
        id
        scoringData
      }
      timestamp
      streamingUrl
    }
  }
`;

const POLL_INTERVAL_MS = 5 * 1000;

function Player(props: { mics: InputDevice[] }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scoringData, setScoringData] = useState<readonly number[]>([]);
  const pollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  let hls: Hls | null = null;

  useEffect(() => {
    if (!videoRef.current) return;

    const pollQueue = () =>
      commitMutation<PlayerPopSongMutation>(environment, {
        mutation: popSongMutation,
        variables: {},
        onCompleted: ({ popSong }) => {
          if (!videoRef.current) return;
          if (popSong !== null) {
            setScoringData(popSong.song.scoringData);
            if (hls) hls.destroy();
            hls = new Hls();
            hls.attachMedia(videoRef.current);
            hls.loadSource(popSong.streamingUrl);
            videoRef.current.play();
          } else {
            pollTimeoutRef.current = setTimeout(pollQueue, POLL_INTERVAL_MS);
          }
        },
      });
    videoRef.current.onended = pollQueue;
    pollQueue();
    return () => {
      if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current);
    };
  }, []);

  return (
    <div className="karaVidContainer">
      <PianoRoll
        scoringData={scoringData}
        videoRef={videoRef}
        mics={props.mics}
      />
      <video className="karaVid" ref={videoRef} controls />
    </div>
  );
}

export default Player;
