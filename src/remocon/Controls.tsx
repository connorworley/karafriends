import React from "react";
import { graphql, useLazyLoadQuery, useMutation } from "react-relay";
import { Link } from "react-router-dom";

import { withLoader } from "../common/components/Loader";
import useQueue from "../common/hooks/useQueue";
import { ControlsRemoveSongMutation } from "./__generated__/ControlsRemoveSongMutation.graphql";
import { ControlsSongsQuery } from "./__generated__/ControlsSongsQuery.graphql";

const controlsSongsQuery = graphql`
  query ControlsSongsQuery($ids: [String!]!) {
    songsByIds(ids: $ids) {
      id
      name
      artistName
    }
  }
`;

const removeSongMutation = graphql`
  mutation ControlsRemoveSongMutation($songId: String!, $timestamp: String!) {
    removeSong(songId: $songId, timestamp: $timestamp)
  }
`;

const Controls = () => {
  const queue = useQueue();
  const songsData = useLazyLoadQuery<ControlsSongsQuery>(controlsSongsQuery, {
    ids: queue.map((item) => item.songId),
  });
  const initialSongsMap: Record<
    string,
    { id: string; name: string; artistName: string }
  > = {};
  const songsMap = songsData.songsByIds.reduce((acc, cur) => {
    acc[cur.id] = cur;
    return acc;
  }, initialSongsMap);
  const [commit, isInFlight] = useMutation<ControlsRemoveSongMutation>(
    removeSongMutation
  );
  const onClickRemoveSong = (songId: string, timestamp: string) => {
    commit({ variables: { songId, timestamp } });
  };
  return (
    <div className="collection">
      {queue.map((item, i) => {
        const song = songsMap[item.songId];
        return (
          <div
            key={`${item.songId}_${i}`}
            className="collection-item"
            style={{ display: "flex" }}
          >
            <Link
              to={`/song/${item.songId}`}
              className="truncate"
              style={{ flex: 1 }}
            >
              {song.artistName} - {song.name}
            </Link>
            <div
              style={{ cursor: "pointer" }}
              onClick={(e) => {
                e.preventDefault();
                onClickRemoveSong(item.songId, item.timestamp);
              }}
            >
              ❌
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default withLoader(Controls);
