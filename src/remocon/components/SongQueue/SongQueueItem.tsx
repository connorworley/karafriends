import formatDuration from "format-duration";
import React, { useState } from "react";
// tslint:disable-next-line:no-submodule-imports
import { FaYoutube } from "react-icons/fa";
// tslint:disable-next-line:no-submodule-imports
import { MdClose, MdMusicVideo } from "react-icons/md";
// tslint:disable-next-line:no-submodule-imports
import { SiNiconico } from "react-icons/si";
import { graphql, useMutation } from "react-relay";
import { useNavigate } from "react-router";

import { cyrb53 } from "../../../common/hash";
import { useQueueQueueQuery$data } from "../../../common/hooks/__generated__/useQueueQueueQuery.graphql";
import useConfig from "../../hooks/useConfig";
import useUserIdentity from "../../hooks/useUserIdentity";
import Marquee from "../Marquee";
import * as styles from "./SongQueue.module.scss";
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
  item: useQueueQueueQuery$data["queue"][0];
  eta: number;
  myNickname: string;
  isCurrent?: boolean;
}

const SongQueueItem = ({ item, eta, myNickname, isCurrent }: Props) => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [commit, isInFlight] = useMutation(removeSongMutation);

  const config = useConfig();
  const identity = useUserIdentity();

  let canRemove = true;

  // Config finally loaded, let's evaluate things
  if (config !== undefined) {
    const itemOwnedByUser =
      item.userIdentity!.nickname === identity.nickname ||
      item.userIdentity!.deviceId === identity.nickname;
    canRemove =
      config.adminNicks.includes(identity.nickname) ||
      config.adminDeviceIds.includes(identity.deviceId) ||
      !(config.supervisedMode === true && !itemOwnedByUser);
  }

  const itemType = item.__typename;
  const nickname =
    (item.userIdentity && item.userIdentity.nickname) || "Unknown";
  const nicknameHash = cyrb53(nickname);
  const nicknameBgColor = `hsl(${(nicknameHash % 180) + 180}, 50%, 50%)`;

  const onClick = () => {
    if (itemType === "DamQueueItem") navigate(`/song/${item.songId}`);
    if (itemType === "JoysoundQueueItem")
      navigate(`/joysoundSong/${item.songId}`);
    if (itemType === "YoutubeQueueItem")
      navigate(`/search/youtube/${item.songId}`);
    if (itemType === "NicoQueueItem")
      navigate(`/search/niconico/${item.songId}`);
  };

  const onRemove = (songId?: string, timestamp?: string) => {
    commit({ variables: { songId, timestamp } });
  };

  let icon = null;
  if (itemType === "DamQueueItem") icon = <MdMusicVideo />;
  if (itemType === "JoysoundQueueItem") icon = <MdMusicVideo />;
  if (itemType === "YoutubeQueueItem") icon = <FaYoutube />;
  if (itemType === "NicoQueueItem") icon = <SiNiconico />;

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
          {item.songId && item.timestamp && !isCurrent && canRemove && (
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
      <div className={styles.songMeta} onClick={onClick}>
        <Marquee>
          <div className={styles.songMetaContent}>
            {icon} {item.artistName} - {item.name}
          </div>
        </Marquee>
      </div>
      {!isCurrent && <div>+{formatDuration(eta * 1000)}</div>}
    </div>
  );
};

export default SongQueueItem;
