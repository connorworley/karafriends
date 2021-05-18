import React from "react";
import { graphql, useLazyLoadQuery, useMutation } from "react-relay";
import { Link } from "react-router-dom";

import { withLoader } from "../common/components/Loader";
import useQueue from "../common/hooks/useQueue";
import { ControlsRemoveSongMutation } from "./__generated__/ControlsRemoveSongMutation.graphql";

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
    <div className="collection">
      {queue.map((item, i) => {
        return (
          <div
            key={`${item.song.id}_${i}`}
            className="collection-item"
            style={{ display: "flex" }}
          >
            <Link
              to={`/song/${item.song.id}`}
              className="truncate"
              style={{ flex: 1 }}
            >
              {item.song.artistName} - {item.song.name}
            </Link>
            <div
              style={{ cursor: "pointer" }}
              onClick={(e) => {
                e.preventDefault();
                onClickRemoveSong(item.song.id, item.timestamp);
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
