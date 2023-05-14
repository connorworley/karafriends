import formatDuration from "format-duration";
import React from "react";

import { cyrb53 } from "../common/hash";
import useQueue from "../common/hooks/useQueue";
import "./Queue.css";

export default function Queue() {
  const queue = useQueue();
  return (
    <div className="collection queueQueue">
      {queue.map(([item, eta], i) => {
        const nickname =
          (item.userIdentity && item.userIdentity.nickname) || "";
        const nicknameHash = cyrb53(nickname);
        const nicknameColor = `hsl(${nicknameHash % 180}, 100%, 50%)`;
        const nicknameBgColor = `hsl(${(nicknameHash % 180) + 180}, 100%, 50%)`;
        return (
          <div
            key={`${item.songId}_${i}`}
            className="collection-item"
            style={{ display: "flex" }}
          >
            <span className="queueMarquee">
              <span className="queueMarqueeInner">
                <span>
                  {item.name} - {item.artistName}{" "}
                  <span
                    style={{
                      backgroundColor: nicknameBgColor,
                      color: nicknameColor,
                    }}
                  >
                    {nickname}
                  </span>{" "}
                  {item.name} - {item.artistName}{" "}
                  <span
                    style={{
                      backgroundColor: nicknameBgColor,
                      color: nicknameColor,
                    }}
                  >
                    {nickname}
                  </span>{" "}
                  {item.name} - {item.artistName}{" "}
                  <span
                    style={{
                      backgroundColor: nicknameBgColor,
                      color: nicknameColor,
                    }}
                  >
                    {nickname}
                  </span>{" "}
                  {item.name} - {item.artistName}{" "}
                  <span
                    style={{
                      backgroundColor: nicknameBgColor,
                      color: nicknameColor,
                    }}
                  >
                    {nickname}
                  </span>{" "}
                </span>
              </span>
            </span>
            <span className="secondary-content">
              {formatDuration(eta * 1000)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
