import formatDuration from "format-duration";
import React, { useEffect, useState } from "react";
import { fetchQuery, graphql, useMutation } from "react-relay";
import { invariant } from "ts-invariant";

import environment from "../../../common/graphqlEnvironment";
import { JoysoundSongPageQuery$data } from "../../pages/__generated__/JoysoundSongPageQuery.graphql";
import Button from "../Button";

import { JoysoundQueueButtonGetVideoDownloadProgressQuery } from "./__generated__/JoysoundQueueButtonGetVideoDownloadProgressQuery.graphql";
import { JoysoundQueueButtonMutation } from "./__generated__/JoysoundQueueButtonMutation.graphql";

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
  nickname: string;
  isRomaji: boolean;
  isDisabled: boolean;
  setDisabled: () => any;
}

const JoysoundQueueButton = ({
  song,
  youtubeVideoId,
  nickname,
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
    let intervalId: number | null = null;

    if (text !== defaultText && text !== "Finished Downloading") {
      invariant(window);

      intervalId = window.setInterval(() => {
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
                `Downloading -- ${data.videoDownloadProgress.progress * 100}%`
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
    };
  }, [text]);

  const onClick = () => {
    commit({
      variables: {
        input: {
          songId: song.id,
          name: song.name,
          playtime: null,
          artistName: song.artistName,
          nickname,
          isRomaji,
          youtubeVideoId,
        },
      },
      onCompleted: ({ queueJoysoundSong }) => {
        switch (queueJoysoundSong.__typename) {
          case "QueueSongInfo":
            setText("Downloading");
            setDisabled();
            break;
          case "QueueSongError":
            setText(`Error: ${queueJoysoundSong.reason}`);
            setDisabled();
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
