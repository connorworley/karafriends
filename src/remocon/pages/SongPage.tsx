import React from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { RouteComponentProps } from "react-router-dom";

import DamQueueButtons from "../components/DamQueueButtons";
import { withLoader } from "../components/Loader";
import { SongPageQuery } from "./__generated__/SongPageQuery.graphql";

const songPageQuery = graphql`
  query SongPageQuery($id: String!) {
    songById(id: $id) {
      id
      name
      nameYomi
      artistName
      artistNameYomi
      lyricsPreview
      vocalTypes
      tieUp
      playtime
    }
  }
`;

interface RouteParams {
  id: string;
}

interface Props extends RouteComponentProps<RouteParams> {}

const SongPage = (props: Props) => {
  const data = useLazyLoadQuery<SongPageQuery>(songPageQuery, {
    id: props.match.params.id,
  });
  const song = data.songById;

  return (
    <div>
      <h2>{song.name}</h2>
      <span>{song.artistName}</span>
      {!!song.tieUp && <span> • {song.tieUp}</span>}
      {!!song.lyricsPreview && (
        <blockquote>{song.lyricsPreview} ...</blockquote>
      )}
      <DamQueueButtons song={song} />
    </div>
  );
};

export default withLoader(SongPage);
