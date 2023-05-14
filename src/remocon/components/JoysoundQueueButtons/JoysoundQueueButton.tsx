import React, { useEffect, useState } from "react";
import { fetchQuery, graphql, useMutation } from "react-relay";
import { Subscription } from "relay-runtime";
import { invariant } from "ts-invariant";

import environment from "../../../common/graphqlEnvironment";
import Button from "../Button";

import { JoysoundSongPageQuery$data } from "../../pages/__generated__/JoysoundSongPageQuery.graphql";
import { JoysoundQueueButtonGetVideoDownloadProgressQuery } from "./__generated__/JoysoundQueueButtonGetVideoDownloadProgressQuery.graphql";
import {
  JoysoundQueueButtonMutation,
  JoysoundQueueButtonMutation$variables,
} from "./__generated__/JoysoundQueueButtonMutation.graphql";

const joysoundQueueButtonGetVideoDownloadProgressQuery = graphql`
  query JoysoundQueueButtonGetVideoDownloadProgressQuery(
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

const joysoundQueueButtonMutation = graphql`
  mutation JoysoundQueueButtonMutation($input: QueueJoysoundSongInput!) {
    queueJoysoundSong(input: $input) {
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
  song: JoysoundSongPageQuery$data["joysoundSongDetail"];
  youtubeVideoId: string | null;
  userIdentity: JoysoundQueueButtonMutation$variables["input"]["userIdentity"];
  isRomaji: boolean;
  isDisabled: boolean;
  setDisabled: (isDisabled: boolean) => void;
}

const JoysoundQueueButton = ({
  song,
  youtubeVideoId,
  userIdentity,
  isRomaji,
  isDisabled,
  setDisabled,
}: Props) => {
  const defaultText = "Queue video" + (isRomaji ? " (Romaji)" : "");

  const [text, setText] = useState(defaultText);
  const [commit] = useMutation<JoysoundQueueButtonMutation>(
    joysoundQueueButtonMutation
  );

  useEffect(() => {
    invariant(window);

    let intervalId: number | null = null;
    let timeoutId: number | null = null;
    let subscription: Subscription | null = null;

    if (text === "Finished Downloading" || text.includes("Error")) {
      timeoutId = window.setTimeout(() => {
        setText(defaultText);
        setDisabled(false);
      }, 2500);
    } else if (text !== defaultText && text !== "Waiting for server...") {
      intervalId = window.setInterval(() => {
        subscription =
          fetchQuery<JoysoundQueueButtonGetVideoDownloadProgressQuery>(
            environment,
            joysoundQueueButtonGetVideoDownloadProgressQuery,
            {
              videoDownloadType: 0,
              songId: song.id,
              suffix: youtubeVideoId,
            }
          ).subscribe({
            next: (
              data: JoysoundQueueButtonGetVideoDownloadProgressQuery["response"]
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

  const onClick = () => {
    setDisabled(true);
    setText("Waiting for server...");

    commit({
      variables: {
        input: {
          songId: song.id,
          name: song.name,
          playtime: null,
          artistName: song.artistName,
          userIdentity,
          isRomaji,
          youtubeVideoId,
        },
      },
      onCompleted: ({ queueJoysoundSong }) => {
        switch (queueJoysoundSong.__typename) {
          case "QueueSongInfo":
            setText("Downloading");
            break;
          case "QueueSongError":
            setText(`Error: ${queueJoysoundSong.reason}`);
            break;
        }
      },
    });
  };

  return (
    <Button disabled={isDisabled} onClick={onClick}>
      {text}
    </Button>
  );
};

export default JoysoundQueueButton;
