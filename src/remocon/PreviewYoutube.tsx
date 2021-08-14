import React, { useEffect, useRef, useState } from "react";
import { graphql, QueryRenderer, useLazyLoadQuery } from "react-relay";
import YoutubePlayer from "youtube-player";
import { withLoader } from "../common/components/Loader";
import YoutubeQueueButton from "./components/YoutubeQueueButton";
import {
  PreviewYoutubeVideoInfoQuery,
  PreviewYoutubeVideoInfoQueryResponse,
} from "./__generated__/PreviewYoutubeVideoInfoQuery.graphql";

import "./PreviewYoutube.css";

const previewYoutubeVideoInfoQuery = graphql`
  query PreviewYoutubeVideoInfoQuery($videoId: String!) {
    youtubeVideoInfo(videoId: $videoId) {
      ... on YoutubeVideoInfo {
        __typename
        author
        channelId
        keywords
        lengthSeconds
        description
        title
        viewCount
      }
      ... on YoutubeVideoInfoError {
        __typename
        reason
      }
    }
  }
`;

type PreviewYoutubeProps = {
  videoId: string;
};

function PreviewYoutube(props: PreviewYoutubeProps) {
  const playerRef: React.MutableRefObject<ReturnType<
    typeof YoutubePlayer
  > | null> = useRef(null);
  const { videoId } = props;
  const videoData = useLazyLoadQuery<PreviewYoutubeVideoInfoQuery>(
    previewYoutubeVideoInfoQuery,
    { videoId }
  );

  useEffect(() => {
    if (playerRef.current == null) {
      playerRef.current = YoutubePlayer("youtube-player", { videoId });
    } else {
      playerRef.current.loadVideoById(videoId);
      playerRef.current.stopVideo();
    }
  }, [props.videoId]);

  function displayVideoInfo(videoInfo: PreviewYoutubeVideoInfoQueryResponse) {
    switch (videoData.youtubeVideoInfo.__typename) {
      case "YoutubeVideoInfo":
        return (
          <div className="flex-container flex-vertical">
            <div className="flex-item">
              <span className="channel-name">
                {videoData.youtubeVideoInfo.author}
              </span>
            </div>
            <div className="flex-item">{videoData.youtubeVideoInfo.title}</div>
            <div className="flex-item">
              View Count: {videoData.youtubeVideoInfo.viewCount} | Video Length:{" "}
              {videoData.youtubeVideoInfo.lengthSeconds}
            </div>
            <div className="flex-item">
              <YoutubeQueueButton
                defaultText={"Queue Song"}
                variables={{
                  input: {
                    id: videoId,
                    name: videoData.youtubeVideoInfo.title,
                    artistName: videoData.youtubeVideoInfo.author,
                    playtime: videoData.youtubeVideoInfo.lengthSeconds,
                    nickname: localStorage.getItem("nickname") || "unknown",
                  },
                }}
              />
            </div>
          </div>
        );
      case "YoutubeVideoInfoError":
        return (
          <div className="flex-item">
            Unable to get video info for the following reason:{" "}
            {videoData.youtubeVideoInfo.reason}
          </div>
        );
    }
  }

  return (
    <div className="flex-container">
      <div className="responsive-player-width">
        <div id="youtube-player" className="flex-item" />
      </div>
      {displayVideoInfo(videoData)}
    </div>
  );
}

export default withLoader(PreviewYoutube);
