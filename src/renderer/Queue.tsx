import formatDuration from "format-duration";
import React from "react";

import useQueue from "../common/hooks/useQueue";
import "./Queue.css";

export default function Queue() {
  const queue = useQueue();
  return (
    <div className="collection queueQueue">
      {queue.map(([item, eta], i) => (
        <div
          key={`${item.id}_${i}`}
          className="collection-item"
          style={{ display: "flex" }}
        >
          {item.name}
          <br />
          {item.artistName}
          <span className="secondary-content">
            T-{formatDuration(eta * 1000)}
          </span>
        </div>
      ))}
    </div>
  );
}
