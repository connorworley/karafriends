import formatDuration from "format-duration";
import React, { useEffect, useState } from "react";
import { graphql, useMutation } from "react-relay";

import { JoysoundSongPageQuery$data } from "../../pages/__generated__/JoysoundSongPageQuery.graphql";
import Button from "../Button";

import { JoysoundQueueButtonMutation } from "./__generated__/JoysoundQueueButtonMutation.graphql";

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
            setText(
              `Estimated wait: T-${formatDuration(
                queueJoysoundSong.eta * 1000
              )}`
            );
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
