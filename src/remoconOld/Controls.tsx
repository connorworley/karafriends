import formatDuration from "format-duration";
import React from "react";
// tslint:disable-next-line:no-submodule-imports
import { FaYoutube } from "react-icons/fa";
// tslint:disable-next-line:no-submodule-imports
import { GiMicrophone } from "react-icons/gi";
// tslint:disable-next-line:no-submodule-imports
import { GrStatusUnknown } from "react-icons/gr";
// tslint:disable-next-line:no-submodule-imports
import { SiNiconico } from "react-icons/si";
import { graphql, useLazyLoadQuery, useMutation } from "react-relay";
import { Link } from "react-router-dom";

import { withLoader } from "../common/components/Loader";
import useQueue from "../common/hooks/useQueue";
import PlaybackControls from "./components/PlaybackControls";
import { ControlsRemoveSongMutation } from "./__generated__/ControlsRemoveSongMutation.graphql";

interface QueueLinkProps {
  typename: string | undefined;
  songId: string | undefined;
  className: string;
  style: object;
  children: React.ReactNode;
}

const QueueLink = (props: QueueLinkProps): JSX.Element | null => {
  let linkUrl: JSX.Element | null = null;
  switch (props.typename) {
    case "DamQueueItem":
      linkUrl = (
        <Link
          to={`/song/${props.songId}`}
          className={props.className}
          style={props.style}
        >
          {props.children}
        </Link>
      );
      break;
    case "YoutubeQueueItem":
      linkUrl = (
        <a
          href={`https://youtu.be/${props.songId}`}
          className={props.className}
          style={props.style}
        >
          {props.children}
        </a>
      );
      break;
    case "NicoQueueItem":
      linkUrl = (
        <a
          href={`https://www.nicovideo.jp/watch/${props.songId}`}
          className={props.className}
          style={props.style}
        >
          {props.children}
        </a>
      );
      break;
  }
  return linkUrl;
};

function getIcon(typename: string | undefined): JSX.Element {
  let icon: JSX.Element = <GrStatusUnknown />;
  switch (typename) {
    case "DamQueueItem":
      icon = <GiMicrophone />;
      break;
    case "YoutubeQueueItem":
      icon = <FaYoutube />;
      break;
    case "NicoQueueItem":
      icon = <SiNiconico />;
      break;
  }
  return icon;
}

const removeSongMutation = graphql`
  mutation ControlsRemoveSongMutation($songId: String!, $timestamp: String!) {
    removeSong(songId: $songId, timestamp: $timestamp)
  }
`;

const Controls = () => {
  const queue = useQueue();
  const [commit, isInFlight] = useMutation<ControlsRemoveSongMutation>(
    removeSongMutation
  );
  const onClickRemoveSong = (songId: string, timestamp: string) => {
    commit({ variables: { songId, timestamp } });
  };

  return (
    <>
      <div className="section">
        <PlaybackControls />
      </div>
      <div className="collection">
        {queue.map(([item, eta], i) => (
          <div
            key={`${item.songId}_${i}`}
            className="collection-item"
            style={{ display: "flex" }}
          >
            <QueueLink
              typename={item.__typename}
              songId={item.songId}
              className="truncate"
              style={{ flex: "1" }}
            >
              {getIcon(item.__typename)} {item.artistName} - {item.name}
            </QueueLink>
            <span className="secondary-content">
              {item.nickname} - T-{formatDuration(eta * 1000)}
            </span>
            <div
              style={{ cursor: "pointer" }}
              onClick={(e) => {
                e.preventDefault();
                if (item.songId && item.timestamp) {
                  onClickRemoveSong(item.songId, item.timestamp);
                }
              }}
            >
              ❌
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default withLoader(Controls);
