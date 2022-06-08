import formatDuration from "format-duration";
import React, { useEffect, useState } from "react";
import { graphql, useMutation } from "react-relay";

import { SongPageQueryResponse } from "../../pages/__generated__/SongPageQuery.graphql";
import Button from "../Button";
import {
  DamQueueButtonMutation,
  DamQueueButtonMutationVariables,
} from "./__generated__/DamQueueButtonMutation.graphql";

const damQueueButtonMutation = graphql`
  mutation DamQueueButtonMutation($input: QueueDamSongInput!) {
    queueDamSong(input: $input) {
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

function getDefaultText(vocalType: string) {
  let defaultText = "Queue song - guide vocal (unknown type)";
  switch (vocalType) {
    case "NORMAL":
      defaultText = "Queue song";
      break;
    case "GUIDE_MALE":
      defaultText = "Queue song - guide vocal (male)";
      break;
    case "GUIDE_FEMALE":
      defaultText = "Queue song - guide vocal (female)";
      break;
  }
  return defaultText;
}

interface Props {
  song: SongPageQueryResponse["songById"];
  streamingUrlIndex: number;
  nickname: string;
}

const DamQueueButton = ({ song, streamingUrlIndex, nickname }: Props) => {
  const defaultText = getDefaultText(song.vocalTypes[streamingUrlIndex]);
  const [text, setText] = useState(defaultText);
  const [commit] = useMutation<DamQueueButtonMutation>(damQueueButtonMutation);

  useEffect(() => {
    const timeout = setTimeout(() => setText(defaultText), 2500);
    return () => clearTimeout(timeout);
  });

  const onClick = () => {
    commit({
      variables: {
        input: {
          songId: song.id,
          name: song.name,
          artistName: song.artistName,
          playtime: song.playtime,
          streamingUrlIdx: streamingUrlIndex,
          nickname,
        },
      },
      onCompleted: ({ queueDamSong }) => {
        switch (queueDamSong.__typename) {
          case "QueueSongInfo":
            setText(
              `Estimated wait: T-${formatDuration(queueDamSong.eta * 1000)}`
            );
            break;
          case "QueueSongError":
            setText(`Error: ${queueDamSong.reason}`);
            break;
        }
      },
    });
  };

  return <Button onClick={onClick}>{text}</Button>;
};

export default DamQueueButton;
