import React, { useEffect, useState } from "react";
import { fetchQuery, graphql, useMutation } from "react-relay";
import { Subscription } from "relay-runtime";
import { invariant } from "ts-invariant";

import environment from "../../../common/graphqlEnvironment";
import Button from "../Button";

import { NiconicoInfoVideoInfoQuery$data } from "./__generated__/NiconicoInfoVideoInfoQuery.graphql";
import { NiconicoQueueButtonGetVideoDownloadProgressQuery } from "./__generated__/NiconicoQueueButtonGetVideoDownloadProgressQuery.graphql";
import {
  NiconicoQueueButtonMutation,
  NiconicoQueueButtonMutation$variables,
} from "./__generated__/NiconicoQueueButtonMutation.graphql";

const niconicoQueueButtonGetVideoDownloadProgressQuery = graphql`
  query NiconicoQueueButtonGetVideoDownloadProgressQuery(
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

const niconicoQueueButtonMutation = graphql`
  mutation NiconicoQueueButtonMutation(
    $input: QueueNicoSongInput!
    $tryHeadOfQueue: Boolean!
  ) {
    queueNicoSong(input: $input, tryHeadOfQueue: $tryHeadOfQueue) {
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
  videoInfo: NiconicoInfoVideoInfoQuery$data["nicoVideoInfo"];
  userIdentity: NiconicoQueueButtonMutation$variables["input"]["userIdentity"];
}

const NiconicoQueueButton = ({ videoId, videoInfo, userIdentity }: Props) => {
  if (videoInfo.__typename !== "NicoVideoInfo") return null;

  const defaultText = "Queue video";
  const [text, setText] = useState(defaultText);
  const [commit] = useMutation<NiconicoQueueButtonMutation>(
    niconicoQueueButtonMutation
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
          fetchQuery<NiconicoQueueButtonGetVideoDownloadProgressQuery>(
            environment,
            niconicoQueueButtonGetVideoDownloadProgressQuery,
            {
              videoDownloadType: 2,
              songId: videoId,
              suffix: null,
            }
          ).subscribe({
            next: (
              data: NiconicoQueueButtonGetVideoDownloadProgressQuery["response"]
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

      if (subscription !== null) {
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
        },
        tryHeadOfQueue: e.shiftKey,
      },
      onCompleted: ({ queueNicoSong }) => {
        switch (queueNicoSong.__typename) {
          case "QueueSongInfo":
            setText("Downloading");
            break;
          case "QueueSongError":
            setText(`Error: ${queueNicoSong.reason}`);
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

export default NiconicoQueueButton;
