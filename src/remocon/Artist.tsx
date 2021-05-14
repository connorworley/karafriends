import React from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { Link, RouteComponentProps } from "react-router-dom";
import { isRomaji, toRomaji } from "wanakana";

import { withLoader } from "../common/components/Loader";
import { ArtistQuery } from "./__generated__/ArtistQuery.graphql";

const artistQuery = graphql`
  query ArtistQuery($id: String!) {
    artistById(id: $id) {
      name
      songs {
        id
        name
        nameYomi
      }
    }
  }
`;

interface ArtistParams {
  id: string;
}

interface Props extends RouteComponentProps<ArtistParams> {}

const Artist = (props: Props) => {
  const { id } = props.match.params;
  const data = useLazyLoadQuery<ArtistQuery>(artistQuery, { id });

  const { name, songs } = data.artistById;

  return (
    <>
      <div className="card">
        <div className="card-content">
          <h5>{name}</h5>
          <p>{songs.length} songs</p>
        </div>
      </div>
      <div className="collection">
        {songs.map((song) => (
          <Link
            to={`/song/${song.id}`}
            className="collection-item"
            key={song.id}
          >
            {song.name}{" "}
            {isRomaji(song.name) ? null : (
              <span className="grey-text text-lighten-2">
                {toRomaji(song.nameYomi)}
              </span>
            )}
          </Link>
        ))}
      </div>
    </>
  );
};

export default withLoader(Artist);
