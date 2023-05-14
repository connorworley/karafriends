import React from "react";
import { graphql, useLazyLoadQuery } from "react-relay";

import useUserIdentity from "../../hooks/useUserIdentity";
import Button from "../Button";
import { withLoader } from "../Loader";
import VideoMetadata from "../VideoMetadata";
import styles from "./NiconicoInfo.module.scss";
import NiconicoQueueButton from "./NiconicoQueueButton";
import { NiconicoInfoVideoInfoQuery } from "./__generated__/NiconicoInfoVideoInfoQuery.graphql";

const niconicoInfoVideoInfoQuery = graphql`
  query NiconicoInfoVideoInfoQuery($videoId: String!) {
    nicoVideoInfo(videoId: $videoId) {
      ... on NicoVideoInfo {
        __typename
        author
        channelId
        lengthSeconds
        title
        thumbnailUrl
        viewCount
      }
      ... on NicoVideoInfoError {
        __typename
        reason
      }
    }
  }
`;

interface Props {
  videoId: string;
}

const NiconicoInfo = ({ videoId }: Props) => {
  const userIdentity = useUserIdentity();

  const videoData = useLazyLoadQuery<NiconicoInfoVideoInfoQuery>(
    niconicoInfoVideoInfoQuery,
    { videoId }
  );

  return (
    <div className={styles.container}>
      {videoData.nicoVideoInfo.__typename === "NicoVideoInfoError" && (
        <div>
          Unable to get video info for the following reason:{" "}
          {videoData.nicoVideoInfo.reason}
        </div>
      )}
      {videoData.nicoVideoInfo.__typename === "NicoVideoInfo" && (
        <>
          <a href={`https://www.nicovideo.jp/watch/${videoId}`} target="_blank">
            <img src={videoData.nicoVideoInfo.thumbnailUrl} />
          </a>
          <VideoMetadata
            videoSource="niconico"
            videoInfo={videoData.nicoVideoInfo}
          />
          <div className={styles.note}>
            ※ Note that Niconico videos tend to take longer to download. Please
            wait warmly until they are ready.
          </div>
          <NiconicoQueueButton
            videoId={videoId}
            videoInfo={videoData.nicoVideoInfo}
            userIdentity={userIdentity}
          />
        </>
      )}
    </div>
  );
};

export default withLoader(NiconicoInfo);
