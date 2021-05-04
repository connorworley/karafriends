import React, { useEffect, useRef, useState } from "react";
import { graphql, commitMutation, fetchQuery } from "react-relay";
import Hls from "hls.js";
import { PlayerPopSongMutation } from "./__generated__/PlayerPopSongMutation.graphql";
import { PlayerStreamingUrlQuery } from "./__generated__/PlayerStreamingUrlQuery.graphql";
import { PlayerScoringDataQuery } from "./__generated__/PlayerScoringDataQuery.graphql";
import environment from "../common/graphqlEnvironment";
import PianoRoll from "./PianoRoll";
import "./Player.css";

const streamingUrlQuery = graphql`
  query PlayerStreamingUrlQuery($id: String!) {
    streamingUrl(id: $id)
  }
`;

const scoringDataQuery = graphql`
  query PlayerScoringDataQuery($id: String!) {
    scoringData(id: $id)
  }
`;

const popSongMutation = graphql`
  mutation PlayerPopSongMutation {
    popSong
  }
`;

const POLL_INTERVAL_MS = 5 * 1000;

function Player() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scoringData, setScoringData] = useState<number[]>([]);
  let hls: Hls | null = null;

  useEffect(() => {
    if (!videoRef.current) return;

    const pollQueue = () => {
      commitMutation<PlayerPopSongMutation>(environment, {
        mutation: popSongMutation,
        variables: {},
        onCompleted: ({ popSong }) => {
          if (popSong !== null) {
            fetchQuery<PlayerStreamingUrlQuery>(
              environment,
              streamingUrlQuery,
              { id: popSong }
            )
              // @ts-ignore: @types/react-relay has an incorrect return type for fetchQuery
              .toPromise()
              .then(({ streamingUrl }: { streamingUrl: string }) => {
                if (videoRef.current) {
                  if (hls) hls.destroy();
                  hls = new Hls();
                  hls.attachMedia(videoRef.current);
                  hls.loadSource(streamingUrl);
                  videoRef.current.play();
                }
              });
            fetchQuery<PlayerScoringDataQuery>(environment, scoringDataQuery, {
              id: popSong,
            })
              // @ts-ignore: @types/react-relay has an incorrect return type for fetchQuery
              .toPromise()
              .then((data: { scoringData: number[] }) => {
                setScoringData(data.scoringData);
              });
          } else {
            setTimeout(pollQueue, POLL_INTERVAL_MS);
          }
        },
      });
    };
    videoRef.current.onended = pollQueue;
    pollQueue();
  }, []);

  return (
    <div className="karaVidContainer">
      <PianoRoll scoringData={scoringData} videoRef={videoRef} />
      <video className="karaVid" ref={videoRef} controls />
    </div>
  );
}

export default Player;
