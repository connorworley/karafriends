import formatDuration from "format-duration";
import React, { useEffect, useState } from "react";
import { graphql, useMutation } from "react-relay";

import {
  NicoQueueButtonMutation,
  NicoQueueButtonMutationVariables,
} from "./__generated__/NicoQueueButtonMutation.graphql";

const nicoQueueButtonMutation = graphql`
  mutation NicoQueueButtonMutation($input: QueueNicoSongInput!) {
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

export default function NicoQueueButton(props: {
  defaultText: string;
  variables: NicoQueueButtonMutationVariables;
}) {
  const [text, setText] = useState(props.defaultText);
  const [commit] = useMutation<NicoQueueButtonMutation>(
    nicoQueueButtonMutation
  );

  const onClick = () => {
    commit({
      variables: props.variables,
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
