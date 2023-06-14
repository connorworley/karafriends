import React, { useEffect, useState } from "react";
import { fetchQuery, graphql, useMutation } from "react-relay";
import { Subscription } from "relay-runtime";
import { invariant } from "ts-invariant";

import environment from "../../../common/graphqlEnvironment";
import Button from "../Button";

import { YouTubeInfoVideoInfoQuery$data } from "./__generated__/YouTubeInfoVideoInfoQuery.graphql";
import { YouTubeQueueButtonGetVideoDownloadProgressQuery } from "./__generated__/YouTubeQueueButtonGetVideoDownloadProgressQuery.graphql";
import {
  YouTubeQueueButtonMutation,
  YouTubeQueueButtonMutation$variables,
} from "./__generated__/YouTubeQueueButtonMutation.graphql";

const youTubeQueueButtonGetVideoDownloadProgressQuery = graphql`
  query YouTubeQueueButtonGetVideoDownloadProgressQuery(
    $videoDownloadType: Int!
    $songId: String!
    $suffix: String
  ) {
    videoDownloadProgress(
      videoDownloadType: $videoDownloadType
      songId: $songId
      suffix: $suffix
    ) {
      progress
    }
  }
`;

const youTubeQueueButtonMutation = graphql`
  mutation YouTubeQueueButtonMutation(
    $input: QueueYoutubeSongInput!
    $tryHeadOfQueue: Boolean!
  ) {
    queueYoutubeSong(input: $input, tryHeadOfQueue: $tryHeadOfQueue) {
      ... on QueueSongInfo {
        __typename
        eta
      }
      ... on QueueSongError {
        __typename
        reason
      }
    }
  }
`;

interface Props {
  videoId: string;
  videoInfo: YouTubeInfoVideoInfoQuery$data["youtubeVideoInfo"];
  adhocSongLyrics: string | null;
  selectedCaption: string | null;
  userIdentity: YouTubeQueueButtonMutation$variables["input"]["userIdentity"];
}

const YouTubeQueueButton = ({
  videoId,
  videoInfo,
  adhocSongLyrics,
  selectedCaption,
  userIdentity,
}: Props) => {
  if (videoInfo.__typename !== "YoutubeVideoInfo") return null;

  const defaultText = "Queue video";
  const [text, setText] = useState(defaultText);
  const [commit] = useMutation<YouTubeQueueButtonMutation>(
    youTubeQueueButtonMutation
  );

  useEffect(() => {
    invariant(window);

    let intervalId: number | null = null;
    let timeoutId: number | null = null;
    let subscription: Subscription | null = null;

    if (text === "Finished Downloading" || text.includes("Error")) {
      timeoutId = window.setTimeout(() => setText(defaultText), 2500);
    } else if (text !== defaultText && text !== "Waiting for server...") {
      intervalId = window.setInterval(() => {
        subscription =
          fetchQuery<YouTubeQueueButtonGetVideoDownloadProgressQuery>(
            environment,
            youTubeQueueButtonGetVideoDownloadProgressQuery,
            {
              videoDownloadType: 1,
              songId: videoId,
              suffix: null,
            }
          ).subscribe({
            next: (
              data: YouTubeQueueButtonGetVideoDownloadProgressQuery["response"]
            ) => {
              if (
                data.videoDownloadProgress.progress === 1.0 ||
                (text !== "Downloading" &&
                  data.videoDownloadProgress.progress === -1.0)
              ) {
                setText("Finished Downloading");
              } else {
                setText(
                  `Downloading -- ${(
                    data.videoDownloadProgress.progress * 100
                  ).toFixed(1)}%`
                );
              }
            },
          });
      }, 1000);
    }

    return () => {
      if (intervalId !== null) {
        clearInterval(intervalId);
      }

      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }

      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [text]);

  const onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setText("Waiting for server...");

    console.log(`tryHeadOfQueue=${e.shiftKey}`);
    commit({
      variables: {
        input: {
          songId: videoId,
          name: videoInfo.title,
          artistName: videoInfo.author,
          playtime: videoInfo.lengthSeconds,
          userIdentity,
          adhocSongLyrics,
          captionCode: selectedCaption || null,
          gainValue: videoInfo.gainValue,
        },
        tryHeadOfQueue: e.shiftKey,
      },
      onCompleted: ({ queueYoutubeSong }) => {
        switch (queueYoutubeSong.__typename) {
          case "QueueSongInfo":
            setText("Downloading");
            break;
          case "QueueSongError":
            setText(`Error: ${queueYoutubeSong.reason}`);
            break;
        }
      },
    });
  };

  return (
    <Button disabled={text !== defaultText} onClick={onClick}>
      {text}
    </Button>
  );
};

export default YouTubeQueueButton;
