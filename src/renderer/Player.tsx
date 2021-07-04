import Hls from "hls.js";
import React, { useEffect, useRef, useState } from "react";
import { commitMutation, fetchQuery, graphql } from "react-relay";
import YoutubePlayer from "youtube-player";
import { PlayerPopSongMutation } from "./__generated__/PlayerPopSongMutation.graphql";

import environment from "../common/graphqlEnvironment";
import { InputDevice } from "./audioSystem";
import PianoRoll from "./PianoRoll";
import "./Player.css";

const popSongMutation = graphql`
  mutation PlayerPopSongMutation {
    popSong {
      ... on DamQueueItem {
        __typename
        id
        streamingUrls {
          url
        }
        scoringData
        timestamp
        streamingUrlIdx
      }
      ... on YoutubeQueueItem {
        __typename
        id
        timestamp
      }
    }
  }
`;

const POLL_INTERVAL_MS = 5 * 1000;

function Player(props: { mics: InputDevice[] }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scoringData, setScoringData] = useState<readonly number[]>([]);
  const [shouldShowPianoRoll, setShouldShowPianoRoll] = useState<boolean>(true);
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
            if (hls) hls.destroy();
            switch (popSong.__typename) {
              case "DamQueueItem":
                setShouldShowPianoRoll(true);
                setScoringData(popSong.scoringData);
                hls = new Hls();
                hls.attachMedia(videoRef.current);
                hls.loadSource(
                  popSong.streamingUrls[popSong.streamingUrlIdx].url
                );
                videoRef.current.play();
                break;
              case "YoutubeQueueItem":
                setShouldShowPianoRoll(false);
                const staticUrl = `http://localhost:8080/static`;
                videoRef.current.src = `${staticUrl}/${popSong.id}.mp4`;
                videoRef.current.play();
                break;
            }
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
      {shouldShowPianoRoll ? (
        <PianoRoll
          scoringData={scoringData}
          videoRef={videoRef}
          mics={props.mics}
        />
      ) : null}
      <video className="karaVid" ref={videoRef} controls />
    </div>
  );
}

export default Player;
