import formatDuration from "format-duration";
import React, { useEffect, useState } from "react";
import { graphql, useMutation } from "react-relay";

import Button from "../Button";
import { NiconicoInfoVideoInfoQuery$data } from "./__generated__/NiconicoInfoVideoInfoQuery.graphql";
import { NiconicoQueueButtonMutation } from "./__generated__/NiconicoQueueButtonMutation.graphql";

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
    const timeout = setTimeout(() => setText(defaultText), 2500);
    return () => clearTimeout(timeout);
  });

  const onClick = () => {
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
            setText(
              `Estimated wait: T-${formatDuration(queueNicoSong.eta * 1000)}`
            );
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
