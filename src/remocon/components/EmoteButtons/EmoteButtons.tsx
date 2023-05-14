import React, { useRef, useState } from "react";
// tslint:disable-next-line:no-submodule-imports
import { MdEdit } from "react-icons/md";
import { graphql, useMutation } from "react-relay";

import useUserIdentity from "../../hooks/useUserIdentity";
import styles from "./EmoteButtons.module.scss";
import { EmoteButtonsMutation } from "./__generated__/EmoteButtonsMutation.graphql";

const emoteButtonsMutation = graphql`
  mutation EmoteButtonsMutation($emote: EmoteInput!) {
    sendEmote(emote: $emote)
  }
`;

const DEFAULT_EMOTES = ["🆓", "🔥", "❤️"];

const EmoteButtons = () => {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [emotes, setEmotes] = useState<string[]>(
    JSON.parse(localStorage.getItem("emotes") || JSON.stringify(DEFAULT_EMOTES))
  );
  const userIdentity = useUserIdentity();
  const [commit] = useMutation<EmoteButtonsMutation>(emoteButtonsMutation);

  const sendEmote = (emote: string) => {
    commit({
      variables: {
        emote: { userIdentity, emote },
      },
    });
  };

  const endEmotes = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const startEmotes = (emote: string) => {
    endEmotes();
    sendEmote(emote);
    intervalRef.current = setInterval(() => sendEmote(emote), 200);
  };

  const showEmotesPrompt = () => {
    const input =
      prompt("Enter a list of emojis", emotes.join("")) || emotes.join("");
    const emojis =
      input.match(/\p{Emoji_Presentation}|\p{Emoji}\uFE0F/gu) || DEFAULT_EMOTES;
    const uniqueEmojis = [...new Set(emojis)];
    localStorage.setItem("emotes", JSON.stringify(uniqueEmojis));
    setEmotes(uniqueEmojis);
  };

  return (
    <div className={styles.emotes}>
      <div className={styles.custom} onClick={() => showEmotesPrompt()}>
        <MdEdit />
      </div>
      {emotes
        .slice()
        .reverse()
        .map((emote) => (
          <div
            key={emote}
            className={styles.emoteItem}
            onMouseDown={() => startEmotes(emote)}
            onMouseLeave={() => endEmotes()}
            onMouseUp={() => endEmotes()}
            onTouchStart={() => startEmotes(emote)}
            onTouchEnd={() => endEmotes()}
          >
            {emote}
          </div>
        ))}
    </div>
  );
};

export default EmoteButtons;
