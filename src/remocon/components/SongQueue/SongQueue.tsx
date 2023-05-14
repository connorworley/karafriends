import React, { useEffect, useState } from "react";

import useQueue from "../../../common/hooks/useQueue";
import useUserIdentity from "../../hooks/useUserIdentity";
import SongQueueItem from "./SongQueueItem";

const SongQueue = () => {
  const queue = useQueue();
  const { nickname } = useUserIdentity();

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
