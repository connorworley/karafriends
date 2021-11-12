/* tslint:disable:no-bitwise */

import formatDuration from "format-duration";
import React from "react";

import useQueue from "../common/hooks/useQueue";
import "./Queue.css";

function cyrb53(str: string, seed = 0) {
  let h1 = 0xdeadbeef ^ seed;
  let h2 = 0x41c6ce57 ^ seed;
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 =
    Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^
    Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 =
    Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^
    Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

const ones = 0b11111111111111111111111111111111111111111111111111111;

export default function Queue() {
  const queue = useQueue();
  return (
    <div className="collection queueQueue">
      {queue.map(([item, eta], i) => {
        const nicknameHash = cyrb53(item.nickname || "");
        const nicknameColor = `#${nicknameHash.toString(16).slice(-6)}`;
        const nicknameBgColor = `#${(ones ^ nicknameHash)
          .toString(16)
          .slice(-6)}`;
        console.log(nicknameHash, nicknameColor, nicknameBgColor);
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
                    {item.nickname}
                  </span>{" "}
                  {item.name} - {item.artistName}{" "}
                  <span
                    style={{
                      backgroundColor: nicknameBgColor,
                      color: nicknameColor,
                    }}
                  >
                    {item.nickname}
                  </span>{" "}
                  {item.name} - {item.artistName}{" "}
                  <span
                    style={{
                      backgroundColor: nicknameBgColor,
                      color: nicknameColor,
                    }}
                  >
                    {item.nickname}
                  </span>{" "}
                  {item.name} - {item.artistName}{" "}
                  <span
                    style={{
                      backgroundColor: nicknameBgColor,
                      color: nicknameColor,
                    }}
                  >
                    {item.nickname}
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
