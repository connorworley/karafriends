import React, { useEffect, useRef, useState } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import invariant from "ts-invariant";
import { withLoader } from "../common/components/Loader";
import NicoQueueButton from "./components/NicoQueueButton";
import {
  NicoInfoVideoInfoQuery,
  NicoInfoVideoInfoQueryResponse,
} from "./__generated__/NicoInfoVideoInfoQuery.graphql";

import "materialize-css/dist/css/materialize.css"; // tslint:disable-line:no-submodule-imports
import "./NicoInfo.css";

const nicoInfoVideoInfoQuery = graphql`
  query NicoInfoVideoInfoQuery($videoId: String!) {
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

type NicoInfoProps = {
  showQueueFields?: boolean;
  showAdhocLyricsFields?: boolean;
  videoId: string;
};

function NicoInfo(props: NicoInfoProps) {
  const { videoId } = props;
  const videoData = useLazyLoadQuery<NicoInfoVideoInfoQuery>(
    nicoInfoVideoInfoQuery,
    { videoId }
  );

  function displayVideoInfo(videoInfo: NicoInfoVideoInfoQueryResponse) {
    switch (videoData.nicoVideoInfo.__typename) {
      case "NicoVideoInfo":
        return (
          <div className="flex-container flex-vertical details-container">
            <div className="flex-item">
              <a
                href={`https://www.nicovideo.jp/user/${videoData.nicoVideoInfo.channelId}`}
              >
                <span className="channel-name">
                  {videoData.nicoVideoInfo.author}
                </span>
              </a>
            </div>
            <div className="flex-item">{videoData.nicoVideoInfo.title}</div>
            <div className="flex-item">
              View Count: {videoData.nicoVideoInfo.viewCount} | Video Length:{" "}
              {videoData.nicoVideoInfo.lengthSeconds}
            </div>
            {props.showQueueFields ? getQueueFields() : null}
          </div>
        );

      case "NicoVideoInfoError":
        return (
          <div className="flex-item">
            Unable to get video info for the following reason:{" "}
            {videoData.nicoVideoInfo.reason}
          </div>
        );
    }
  }

  function getQueueFields() {
    invariant(videoData.nicoVideoInfo.__typename === "NicoVideoInfo");
    return (
      <>
        <div className="flex-item">
          <NicoQueueButton
            defaultText={"Queue Song"}
            variables={{
              input: {
                songId: videoId,
                name: videoData.nicoVideoInfo.title,
                artistName: videoData.nicoVideoInfo.author,
                playtime: videoData.nicoVideoInfo.lengthSeconds,
                nickname: localStorage.getItem("nickname") || "unknown",
              },
            }}
          />
        </div>
        <div className="flex-item">
          Note that Niconico videos tend to take longer to add to the queue.
          Wait for a few minutes before trying again if it doesn't appear.
        </div>
      </>
    );
  }

  return (
    <div className="flex-container card">
      <div className="responsive-image-width">
        <a href={`https://www.nicovideo.jp/watch/${videoId}`}>
          <img
            src={
              videoData.nicoVideoInfo.__typename === "NicoVideoInfo"
                ? videoData.nicoVideoInfo.thumbnailUrl
                : ""
            }
            id="video-image"
            className="flex-item"
          />
        </a>
      </div>
      {displayVideoInfo(videoData)}
    </div>
  );
}

export default withLoader(NicoInfo);
