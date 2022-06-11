import React from "react";
import { graphql, useLazyLoadQuery } from "react-relay";

import Button from "../Button";
import { withLoader } from "../Loader";
import styles from "./NiconicoInfo.module.scss";
import NiconicoMetadata from "./NiconicoMetadata";
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
  const videoData = useLazyLoadQuery<NiconicoInfoVideoInfoQuery>(
    niconicoInfoVideoInfoQuery,
    { videoId }
  );

  return (
    <div className={styles.container}>
      {videoData.nicoVideoInfo.__typename === "NicoVideoInfoError" ? (
        <div>
          Unable to get video info for the following reason:{" "}
          {videoData.nicoVideoInfo.reason}
        </div>
      ) : (
        <>
          {videoData.nicoVideoInfo.__typename === "NicoVideoInfo" && (
            <a href={`https://www.nicovideo.jp/watch/${videoId}`}>
              <img src={videoData.nicoVideoInfo.thumbnailUrl} />
            </a>
          )}
          <NiconicoMetadata videoInfo={videoData.nicoVideoInfo} />
          <NiconicoQueueButton
            videoId={videoId}
            videoInfo={videoData.nicoVideoInfo}
          />
          <div>
            Note that Niconico videos tend to take longer to add to the queue.
            Wait for a few minutes before trying again if it doesn't appear.
          </div>
        </>
      )}
    </div>
  );
};

export default withLoader(NiconicoInfo);
