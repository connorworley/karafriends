import React, { useState } from "react";
import { graphql, useLazyLoadQuery, useMutation } from "react-relay";
import { RouteComponentProps } from "react-router-dom";

import { withLoader } from "../common/components/Loader";
import { SongMutation } from "./__generated__/SongMutation.graphql";
import { SongQuery } from "./__generated__/SongQuery.graphql";

const songQuery = graphql`
  query SongQuery($id: String!) {
    songsByIds(ids: [$id]) {
      name
      artistName
      lyricsPreview
    }
  }
`;

const songMutation = graphql`
  mutation SongMutation($id: String!) {
    queueSong(id: $id)
  }
`;

interface SongParams {
  id: string;
}

interface Props extends RouteComponentProps<SongParams> {}

function Song(props: Props) {
  const { id } = props.match.params;
  const [queued, setQueued] = useState(false);
  const data = useLazyLoadQuery<SongQuery>(songQuery, { id });
  const [commit, isInFlight] = useMutation<SongMutation>(songMutation);

  const { name, artistName, lyricsPreview } = data.songsByIds[0];

  const onClickQueueSong = () => {
    commit({
      variables: { id },
      onCompleted: ({ queueSong }) => setQueued(queueSong),
    });
  };

  return (
    <div className="card">
      <div className="card-content">
        <h6>{artistName}</h6>
        <h5>{name}</h5>
        {!!lyricsPreview && <blockquote>{lyricsPreview} ...</blockquote>}
      </div>
      <div className="card-action">
        <button
          className={`btn ${queued ? "disabled" : ""}`}
          onClick={onClickQueueSong}
        >
          {queued ? "Queued!" : "Queue song"}
        </button>
      </div>
    </div>
  );
}

export default withLoader(Song);
