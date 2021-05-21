import formatDuration from "format-duration";
import React, { useEffect, useState } from "react";
import { graphql, useMutation } from "react-relay";

import {
  YoutubeQueueButtonMutation,
  YoutubeQueueButtonMutationVariables,
} from "./__generated__/YoutubeQueueButtonMutation.graphql";

const youtubeQueueButtonMutation = graphql`
  mutation YoutubeQueueButtonMutation($input: QueueYoutubeSongInput!) {
    queueYoutubeSong(input: $input)
  }
`;

export default function YoutubeQueueButton(props: {
  defaultText: string;
  variables: YoutubeQueueButtonMutationVariables;
}) {
  const [text, setText] = useState(props.defaultText);
  const [commit] = useMutation<YoutubeQueueButtonMutation>(
    youtubeQueueButtonMutation
  );

  const onClick = () => {
    commit({
      variables: props.variables,
      onCompleted: ({ queueYoutubeSong }) =>
        setText(`Estimated wait: T-${formatDuration(queueYoutubeSong * 1000)}`),
    });
  };

  useEffect(() => {
    const timeout = setTimeout(() => setText(props.defaultText), 2500);
    return () => clearTimeout(timeout);
  });

  return (
    <button
      className={`btn ${text !== props.defaultText ? "disabled" : ""}`}
      onClick={onClick}
    >
      {text}
    </button>
  );
}
