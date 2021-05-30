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
          <span className="queueMarquee">
            <span className="queueMarqueeInner">
              <span>
                {item.name} - {item.artistName}
                {" - "}
                {item.name} - {item.artistName}
                {" - "}
                {item.name} - {item.artistName}
                {" - "}
                {item.name} - {item.artistName}
                {" - "}
              </span>
            </span>
          </span>
          <span className="secondary-content">
            {formatDuration(eta * 1000)}
          </span>
        </div>
      ))}
    </div>
  );
}
