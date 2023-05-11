import React, { useEffect, useState } from "react";
import { fetchQuery, graphql, useMutation } from "react-relay";
import { invariant } from "ts-invariant";

import environment from "../../../common/graphqlEnvironment";
import Button from "../Button";

import { NiconicoInfoVideoInfoQuery$data } from "./__generated__/NiconicoInfoVideoInfoQuery.graphql";
import { NiconicoQueueButtonGetVideoDownloadProgressQuery } from "./__generated__/NiconicoQueueButtonGetVideoDownloadProgressQuery.graphql";
import { NiconicoQueueButtonMutation } from "./__generated__/NiconicoQueueButtonMutation.graphql";

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
  mutation NiconicoQueueButtonMutation($input: QueueNicoSongInput!) {
    queueNicoSong(input: $input) {
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
}

const NiconicoQueueButton = ({ videoId, videoInfo }: Props) => {
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

    if (text === "Finished Downloading" || text.includes("Error")) {
      timeoutId = window.setTimeout(() => setText(defaultText), 2500);
    } else if (text !== defaultText && text !== "Waiting for server...") {
      intervalId = window.setInterval(() => {
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
    };
  }, [text]);

  const onClick = () => {
    setText("Waiting for server...");

    commit({
      variables: {
        input: {
          songId: videoId,
          name: videoInfo.title,
          artistName: videoInfo.author,
          playtime: videoInfo.lengthSeconds,
          nickname: localStorage.getItem("nickname") || "unknown",
        },
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
