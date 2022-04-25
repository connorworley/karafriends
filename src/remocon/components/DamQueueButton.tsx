import formatDuration from "format-duration";
import React, { useEffect, useState } from "react";
import { graphql, useMutation } from "react-relay";

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

export default function DamQueueButton(props: {
  defaultText: string;
  variables: DamQueueButtonMutationVariables;
}) {
  const [text, setText] = useState(props.defaultText);
  const [commit] = useMutation<DamQueueButtonMutation>(damQueueButtonMutation);

  const onClick = () => {
    commit({
      variables: props.variables,
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
