import Hls from "hls.js";
import React, { useEffect, useRef, useState } from "react";
import { commitMutation, fetchQuery, graphql } from "react-relay";
import YoutubePlayer from "youtube-player";
import { PlayerPopSongMutation } from "./__generated__/PlayerPopSongMutation.graphql";

import environment from "../common/graphqlEnvironment";
import usePlaybackState from "../common/hooks/usePlaybackState";
import AdhocLyrics from "./AdhocLyrics";
import { InputDevice } from "./audioSystem";
import PianoRoll from "./PianoRoll";
import "./Player.css";

const popSongMutation = graphql`
  mutation PlayerPopSongMutation {
    popSong {
      ... on DamQueueItem {
        __typename
        songId
        streamingUrls {
          url
        }
        scoringData
        timestamp
        streamingUrlIdx
      }
      ... on YoutubeQueueItem {
        __typename
        songId
        timestamp
        hasAdhocLyrics
        hasCaptions
      }
    }
  }
`;

const POLL_INTERVAL_MS = 5 * 1000;

function Player(props: { mics: InputDevice[] }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const trackRef = useRef<HTMLTrackElement>(null);
  const [scoringData, setScoringData] = useState<readonly number[]>([]);
  const [shouldShowPianoRoll, setShouldShowPianoRoll] = useState<boolean>(true);
  const [shouldShowAdhocLyrics, setShouldShowAdhocLyrics] = useState<boolean>(
    false
  );
  const { playbackState, setPlaybackState } = usePlaybackState();
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
          if (trackRef?.current) {
            trackRef.current.default = false;
            trackRef.current.src = "";
          }
          if (popSong !== null) {
            if (hls) hls.destroy();
            switch (popSong.__typename) {
              case "DamQueueItem":
                setShouldShowPianoRoll(true);
                setShouldShowAdhocLyrics(false);
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
                setShouldShowAdhocLyrics(popSong.hasAdhocLyrics);
                const staticUrl = `http://localhost:8080/static`;
                videoRef.current.src = `${staticUrl}/${popSong.songId}.mp4`;
                if (trackRef?.current && popSong?.hasCaptions) {
                  trackRef.current.default = true;
                  trackRef.current.src = `${staticUrl}/${popSong.songId}.vtt`;
                }
                videoRef.current.play();
                break;
            }
            setPlaybackState("PLAYING");
          } else {
            setPlaybackState("WAITING");
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

  useEffect(() => {
    if (!videoRef.current) return;
    switch (playbackState) {
      case "PAUSED":
        videoRef.current.pause();
        break;
      case "PLAYING":
        videoRef.current.play();
        break;
      case "RESTARTING":
        videoRef.current.currentTime = 0;
        setPlaybackState("PLAYING");
        break;
      case "SKIPPING":
        videoRef.current.currentTime = videoRef.current.duration;
        videoRef.current.play();
        break;
    }
  }, [playbackState]);

  return (
    <div className="karaVidContainer">
      {shouldShowPianoRoll ? (
        <PianoRoll
          scoringData={scoringData}
          videoRef={videoRef}
          mics={props.mics}
        />
      ) : null}
      <video
        className="karaVid"
        ref={videoRef}
        crossOrigin="anonymous"
        controls
      >
        <track ref={trackRef} kind="subtitles" src="" default />
      </video>
      {shouldShowAdhocLyrics ? <AdhocLyrics /> : null}
    </div>
  );
}

export default Player;
