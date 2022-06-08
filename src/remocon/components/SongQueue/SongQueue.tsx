import React from "react";

import useQueue from "../../../common/hooks/useQueue";

const SongQueue = () => {
  const queue = useQueue();

  return (
    <div>
      {queue.map(([item, eta], i) => (
        <div key={`${item.songId}_${i}`}>
          {item.artistName} - {item.name}
        </div>
      ))}
    </div>
  );
};

export default SongQueue;
