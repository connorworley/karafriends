import React from "react";
import { graphql, useLazyLoadQuery, useMutation } from "react-relay";
import { Link } from "react-router-dom";

import { withLoader } from "../common/components/Loader";
import { ControlsQueueQuery } from "./__generated__/ControlsQueueQuery.graphql";
import { ControlsRemoveSongMutation } from "./__generated__/ControlsRemoveSongMutation.graphql";
import { ControlsSongsQuery } from "./__generated__/ControlsSongsQuery.graphql";

const controlsQueueQuery = graphql`
  query ControlsQueueQuery {
    queue {
      id
      timestamp
    }
  }
`;

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
  mutation ControlsRemoveSongMutation($id: String!, $timestamp: String!) {
    removeSong(id: $id, timestamp: $timestamp)
  }
`;

const Controls = () => {
  const queueData = useLazyLoadQuery<ControlsQueueQuery>(
    controlsQueueQuery,
    {}
  );
  const songsData = useLazyLoadQuery<ControlsSongsQuery>(controlsSongsQuery, {
    ids: queueData.queue.map((item) => item.id),
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
  const onClickRemoveSong = (id: string, timestamp: string) => {
    commit({ variables: { id, timestamp } });
  };
  return (
    <div className="collection">
      {queueData.queue.map((item, i) => {
        const song = songsMap[item.id];
        return (
          <div
            key={`${item.id}_${i}`}
            className="collection-item"
            style={{ display: "flex" }}
          >
            <Link
              to={`/song/${item.id}`}
              className="truncate"
              style={{ flex: 1 }}
            >
              {song.artistName} - {song.name}
            </Link>
            <div
              style={{ cursor: "pointer" }}
              onClick={(e) => {
                e.preventDefault();
                onClickRemoveSong(item.id, item.timestamp);
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
