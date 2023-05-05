import React from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { Link, RouteComponentProps } from "react-router-dom";

import JoysoundQueueButtons from "../components/JoysoundQueueButtons";
import { withLoader } from "../components/Loader";
import { JoysoundSongPageQuery } from "./__generated__/JoysoundSongPageQuery.graphql";

const joysoundSongPageQuery = graphql`
  query JoysoundSongPageQuery($id: String!) {
    joysoundSongDetail(id: $id) {
      id
      name
      artistName
      lyricsPreview
      tieUp
    }
  }
`;

interface RouteParams {
  id: string;
}

interface Props extends RouteComponentProps<RouteParams> {}

const JoysoundSongPage = (props: Props) => {
  const data = useLazyLoadQuery<JoysoundSongPageQuery>(joysoundSongPageQuery, {
    id: props.match.params.id,
  });

  const song = data.joysoundSongDetail;

  return (
    <div>
      <h2>{song.name}</h2>
      <Link to={`/search/artist/${song.artistName}`}>{song.artistName}</Link>
      {!!song.tieUp && <span> • {song.tieUp}</span>}
      {!!song.lyricsPreview && (
        <blockquote>{song.lyricsPreview} ...</blockquote>
      )}
      <JoysoundQueueButtons song={song} />
    </div>
  );
};

export default withLoader(JoysoundSongPage);
