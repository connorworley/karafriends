import formatDuration from "format-duration";
import React, { useEffect, useState } from "react";
import { graphql, useMutation } from "react-relay";

import {
  QueueButtonMutation,
  QueueButtonMutationVariables,
} from "./__generated__/QueueButtonMutation.graphql";

const queueButtonMutation = graphql`
  mutation QueueButtonMutation($song: SongInput!, $streamingUrlIdx: Int!) {
    queueSong(song: $song, streamingUrlIdx: $streamingUrlIdx)
  }
`;

export default function QueueButton(props: {
  defaultText: string;
  variables: QueueButtonMutationVariables;
}) {
  const [text, setText] = useState(props.defaultText);
  const [commit, isInFlight] = useMutation<QueueButtonMutation>(
    queueButtonMutation
  );

  const onClick = () => {
    commit({
      variables: props.variables,
      onCompleted: ({ queueSong }) =>
        setText(`Estimated wait: T-${formatDuration(queueSong * 1000)}`),
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
