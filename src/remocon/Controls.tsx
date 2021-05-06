import React from "react";
import { graphql, useLazyLoadQuery, useMutation } from "react-relay";
import { Link } from "react-router-dom";

import { withLoader } from "../common/components/Loader";
import { ControlsQuery } from "./__generated__/ControlsQuery.graphql";

const controlsQuery = graphql`
  query ControlsQuery {
    songsInQueue {
      id
      name
      artistName
    }
  }
`;

const Controls = () => {
  const data = useLazyLoadQuery<ControlsQuery>(controlsQuery, {});
  return (
    <div className="collection">
      {data.songsInQueue.map((song, i) => (
        <Link
          key={`${song.id}_${i}`}
          className="collection-item"
          to={`/song/${song.id}`}
        >
          {song.artistName} - {song.name}
        </Link>
      ))}
    </div>
  );
};

export default withLoader(Controls);
