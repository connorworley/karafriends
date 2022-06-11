import React, { useEffect, useRef, useState } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { Link } from "react-router-dom";
import YouTubePlayer from "youtube-player";

import Button from "../Button";
import { withLoader } from "../Loader";
import styles from "./YouTubeInfo.module.scss";
import YouTubeLyricsForm from "./YouTubeLyricsForm";
import YouTubeMetadata from "./YouTubeMetadata";
import YouTubeQueueButton from "./YouTubeQueueButton";
import { YouTubeInfoVideoInfoQuery } from "./__generated__/YouTubeInfoVideoInfoQuery.graphql";

const youTubeInfoVideoInfoQuery = graphql`
  query YouTubeInfoVideoInfoQuery($videoId: String!) {
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
}

const YouTubeInfo = ({ videoId }: Props) => {
  const playerRef: React.MutableRefObject<ReturnType<
    typeof YouTubePlayer
  > | null> = useRef(null);
  const [adhocSongLyrics, setAdhocSongLyrics] = useState<string | null>(null);
  const [selectedCaption, setSelectedCaption] = useState<string | undefined>(
    undefined
  );
  const videoData = useLazyLoadQuery<YouTubeInfoVideoInfoQuery>(
    youTubeInfoVideoInfoQuery,
    { videoId }
  );

  useEffect(() => {
    if (playerRef.current == null) {
      playerRef.current = YouTubePlayer("youtube-player", { videoId });
    } else {
      playerRef.current.loadVideoById(videoId);
      playerRef.current.stopVideo();
    }
  }, [videoId]);

  return (
    <div className={styles.container}>
      <div id="youtube-player" />
      {videoData.youtubeVideoInfo.__typename === "YoutubeVideoInfoError" ? (
        <div>
          Unable to get video info for the following reason:{" "}
          {videoData.youtubeVideoInfo.reason}
        </div>
      ) : (
        <>
          <YouTubeMetadata videoInfo={videoData.youtubeVideoInfo} />
          <YouTubeLyricsForm
            videoInfo={videoData.youtubeVideoInfo}
            onSelectCaption={(language) => setSelectedCaption(language)}
            onAdhocLyricsChanged={(lyrics) => setAdhocSongLyrics(lyrics)}
          />
          <YouTubeQueueButton
            videoId={videoId}
            videoInfo={videoData.youtubeVideoInfo}
            adhocSongLyrics={adhocSongLyrics}
            selectedCaption={selectedCaption || null}
          />
          <Link to={`/adhocLyrics/${videoId}`}>
            <Button>Guide adhoc lyrics</Button>
          </Link>
        </>
      )}
    </div>
  );
};

export default withLoader(YouTubeInfo);
