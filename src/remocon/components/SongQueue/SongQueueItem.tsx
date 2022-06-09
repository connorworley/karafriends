import formatDuration from "format-duration";
import React, { useState } from "react";
// tslint:disable-next-line:no-submodule-imports
import { MdClose } from "react-icons/md";
import { graphql, useMutation } from "react-relay";

import { cyrb53 } from "../../../common/hash";
import { useQueueQueueQueryResponse } from "../../../common/hooks/__generated__/useQueueQueueQuery.graphql";
import Marquee from "../Marquee";
import styles from "./SongQueue.module.scss";
import { SongQueueItemRemoveSongMutation } from "./__generated__/SongQueueItemRemoveSongMutation.graphql";

const removeSongMutation = graphql`
  mutation SongQueueItemRemoveSongMutation(
    $songId: String!
    $timestamp: String!
  ) {
    removeSong(songId: $songId, timestamp: $timestamp)
  }
`;

interface Props {
  item: useQueueQueueQueryResponse["queue"][0];
  eta: number;
  myNickname: string;
}

const SongQueueItem = ({ item, eta, myNickname }: Props) => {
  const [expanded, setExpanded] = useState(false);
  const [commit, isInFlight] = useMutation(removeSongMutation);

  const nickname = item.nickname || "Unknown";
  const nicknameHash = cyrb53(nickname);
  const nicknameBgColor = `hsl(${(nicknameHash % 180) + 180}, 50%, 50%)`;

  const onRemove = (songId?: string, timestamp?: string) => {
    commit({ variables: { songId, timestamp } });
  };

  return (
    <div className={styles.queueItem}>
      {expanded ? (
        <div className={styles.controls}>
          <div
            className={styles.nickname}
            style={{ backgroundColor: nicknameBgColor }}
            onClick={() => setExpanded(false)}
          >
            {nickname}
          </div>
          {item.songId && item.timestamp && nickname === myNickname && (
            <div
              className={styles.remove}
              onClick={() => onRemove(item.songId, item.timestamp)}
            >
              <MdClose />
            </div>
          )}
        </div>
      ) : (
        <div
          className={styles.initial}
          style={{ backgroundColor: nicknameBgColor }}
          onClick={() => setExpanded(true)}
        >
          {nickname.slice(0, 1)}
        </div>
      )}
      <Marquee className={styles.songMeta}>
        <div className={styles.songMetaContent}>
          {item.artistName} - {item.name}
        </div>
      </Marquee>
      <div>+{formatDuration(eta * 1000)}</div>
    </div>
  );
};

export default SongQueueItem;
