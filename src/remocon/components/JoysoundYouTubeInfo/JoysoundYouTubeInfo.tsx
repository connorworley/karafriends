import React, { useEffect, useRef, useState } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import YouTubePlayer from "youtube-player";

import { withLoader } from "../Loader";
import VideoMetadata from "../VideoMetadata";
import * as styles from "./JoysoundYouTubeInfo.module.scss";
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
  setYoutubeVideoId: (videoId: string) => void;
}

const JoysoundYouTubeInfo = ({ videoId, setYoutubeVideoId }: Props) => {
  const playerRef: React.MutableRefObject<ReturnType<
    typeof YouTubePlayer
  > | null> = useRef(null);
  const videoData = useLazyLoadQuery<JoysoundYouTubeInfoVideoInfoQuery>(
    joysoundYouTubeInfoVideoInfoQuery,
    { videoId }
  );

  useEffect(() => {
    if (playerRef.current == null) {
      playerRef.current = YouTubePlayer("youtube-player", {
        videoId,
      });
    } else {
      playerRef.current.loadVideoById(videoId);
      playerRef.current.stopVideo();
    }

    if (
      videoId &&
      videoData.youtubeVideoInfo.__typename === "YoutubeVideoInfo"
    ) {
      setYoutubeVideoId(videoId);
    }
  }, [videoId]);

  return (
    <div className={styles.container}>
      <h3>Selected background video: {videoId}</h3>
      <div
        id="youtube-player"
        style={{
          display:
            videoData.youtubeVideoInfo.__typename === "YoutubeVideoInfoError"
              ? "none"
              : "block",
        }}
      />
      {videoData.youtubeVideoInfo.__typename === "YoutubeVideoInfoError" && (
        <p>
          Unable to get video info for the following reason:{" "}
          {videoData.youtubeVideoInfo.reason}
        </p>
      )}
      {videoData.youtubeVideoInfo.__typename === "YoutubeVideoInfo" && (
        <VideoMetadata
          videoSource="youtube"
          videoInfo={videoData.youtubeVideoInfo}
        />
      )}
    </div>
  );
};

export default withLoader(JoysoundYouTubeInfo);
