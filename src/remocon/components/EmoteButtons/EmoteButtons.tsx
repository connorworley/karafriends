import React, { useState } from "react";
// tslint:disable-next-line:no-submodule-imports
import { FaSmile } from "react-icons/fa";
import { graphql, useMutation } from "react-relay";

import useNickname from "../../hooks/useNickname";
import styles from "./EmoteButtons.module.scss";
import { EmoteButtonsMutation } from "./__generated__/EmoteButtonsMutation.graphql";

const emoteButtonsMutation = graphql`
  mutation EmoteButtonsMutation($emote: EmoteInput!) {
    sendEmote(emote: $emote)
  }
`;

const emotes = ["🔥", "🆓"];

const EmoteButtons = () => {
  const nickname = useNickname();
  const [expanded, setExpanded] = useState(false);
  const [commit] = useMutation<EmoteButtonsMutation>(emoteButtonsMutation);

  const sendEmote = (emote: string) => {
    commit({
      variables: {
        emote: { nickname, emote },
      },
    });
  };

  return (
    <div className={styles.emotes}>
      {expanded &&
        emotes.map((emote) => (
          <div
            key={emote}
            className={styles.emoteItem}
            onClick={() => sendEmote(emote)}
          >
            {emote}
          </div>
        ))}
      <div className={styles.toggle} onClick={() => setExpanded(!expanded)}>
        <FaSmile />
      </div>
    </div>
  );
};

export default EmoteButtons;
