import React, { useEffect, useRef, useState } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import YouTubePlayer from "youtube-player";

import Button from "../Button";
import { withLoader } from "../Loader";
import VideoMetadata from "../VideoMetadata";
import styles from "./JoysoundYouTubeInfo.module.scss";
import { JoysoundYouTubeInfoVideoInfoQuery } from "./__generated__/JoysoundYouTubeInfoVideoInfoQuery.graphql";

const joysoundYouTubeInfoVideoInfoQuery = graphql`
  query JoysoundYouTubeInfoVideoInfoQuery($videoId: String!) {
    youtubeVideoInfo(videoId: $videoId) {
      ... on YoutubeVideoInfo {
        __typename
        author
        captionLanguages {
          name
          code
        }
        channelId
        keywords
        lengthSeconds
        title
        viewCount
        gainValue
      }
      ... on YoutubeVideoInfoError {
        __typename
        reason
      }
    }
  }
`;

interface Props {
  videoId: string;
  candidateVideoId: string;
  setYoutubeVideoId: (videoId: string) => void;
}

const JoysoundYouTubeInfo = ({
  videoId,
  candidateVideoId,
  setYoutubeVideoId,
}: Props) => {
  const playerRef: React.MutableRefObject<ReturnType<
    typeof YouTubePlayer
  > | null> = useRef(null);
  const videoData = useLazyLoadQuery<JoysoundYouTubeInfoVideoInfoQuery>(
    joysoundYouTubeInfoVideoInfoQuery,
    { videoId: candidateVideoId }
  );

  useEffect(() => {
    if (playerRef.current == null) {
      playerRef.current = YouTubePlayer("youtube-player", {
        videoId: candidateVideoId,
      });
    } else {
      playerRef.current.loadVideoById(candidateVideoId);
      playerRef.current.stopVideo();
    }
  }, [candidateVideoId]);

  const attachOnClick = () => {
    setYoutubeVideoId(candidateVideoId);
  };

  const detatchOnClick = () => {
    setYoutubeVideoId("");
  };

  return (
    <div className={styles.container}>
      <div id="youtube-player" />
      {videoData.youtubeVideoInfo.__typename === "YoutubeVideoInfoError" && (
        <div>
          Unable to get video info for the following reason:{" "}
          {videoData.youtubeVideoInfo.reason}
        </div>
      )}
      {videoData.youtubeVideoInfo.__typename === "YoutubeVideoInfo" && (
        <>
          <VideoMetadata
            videoSource="youtube"
            videoInfo={videoData.youtubeVideoInfo}
          />
          <Button
            disabled={videoId === candidateVideoId}
            onClick={attachOnClick}
          >
            Attach Youtube Video
          </Button>
          <Button disabled={videoId === ""} onClick={detatchOnClick}>
            Detatch Youtube Video (Currently Attached:{" "}
            {videoId ? videoId : "None"})
          </Button>
        </>
      )}
    </div>
  );
};

export default withLoader(JoysoundYouTubeInfo);
