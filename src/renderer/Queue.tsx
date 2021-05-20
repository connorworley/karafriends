import React from "react";

import useQueue from "../common/hooks/useQueue";
import "./Queue.css";

export default function Queue() {
  const queue = useQueue();
  return (
    <div className="collection queueQueue">
      {queue.map((item, i) => (
        <div
          key={`${item.song.id}_${i}`}
          className="collection-item"
          style={{ display: "flex" }}
        >
          {item.song.name}
          <br />
          {item.song.artistName}
        </div>
      ))}
    </div>
  );
}
