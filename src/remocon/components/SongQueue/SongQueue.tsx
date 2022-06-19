import React, { useEffect, useState } from "react";

import { cyrb53 } from "../../../common/hash";
import useQueue from "../../../common/hooks/useQueue";
import useNickname from "../../hooks/useNickname";
import SongQueueItem from "./SongQueueItem";

const SongQueue = () => {
  const queue = useQueue();
  const nickname = useNickname();

  return (
    <div>
      {queue.map(([item, eta], i) => (
        <SongQueueItem
          key={`${item.songId}_${item.timestamp}`}
          item={item}
          eta={eta}
          myNickname={nickname}
        />
      ))}
      {queue.length === 0 && <span>The queue is empty</span>}
    </div>
  );
};

export default SongQueue;
