import formatDuration from "format-duration";
import React, { useEffect, useState } from "react";
import { graphql, useMutation } from "react-relay";

import useNickname from "../../hooks/useNickname";
import Button from "../Button";
import { YouTubeInfoVideoInfoQueryResponse } from "./__generated__/YouTubeInfoVideoInfoQuery.graphql";
import { YouTubeQueueButtonMutation } from "./__generated__/YouTubeQueueButtonMutation.graphql";

const youTubeQueueButtonMutation = graphql`
  mutation YouTubeQueueButtonMutation($input: QueueYoutubeSongInput!) {
    queueYoutubeSong(input: $input) {
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
  videoInfo: YouTubeInfoVideoInfoQueryResponse["youtubeVideoInfo"];
  adhocSongLyrics: string | null;
  selectedCaption: string | null;
}

const YouTubeQueueButton = ({
  videoId,
  videoInfo,
  adhocSongLyrics,
  selectedCaption,
}: Props) => {
  if (videoInfo.__typename !== "YoutubeVideoInfo") return null;

  const nickname = useNickname();
  const defaultText = "Queue video";
  const [text, setText] = useState(defaultText);
  const [commit] = useMutation<YouTubeQueueButtonMutation>(
    youTubeQueueButtonMutation
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
          nickname,
          adhocSongLyrics,
          captionCode: selectedCaption || null,
        },
      },
      onCompleted: ({ queueYoutubeSong }) => {
        switch (queueYoutubeSong.__typename) {
          case "QueueSongInfo":
            setText(
              `Estimated wait: T-${formatDuration(queueYoutubeSong.eta * 1000)}`
            );
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
