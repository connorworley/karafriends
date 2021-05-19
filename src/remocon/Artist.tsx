import React from "react";
import { graphql, useLazyLoadQuery, usePaginationFragment } from "react-relay";
import { Link, RouteComponentProps } from "react-router-dom";
import { isRomaji, toRomaji } from "wanakana";

import { withLoader } from "../common/components/Loader";
import { ArtistPaginationQuery } from "./__generated__/ArtistPaginationQuery.graphql";
import { ArtistViewQuery } from "./__generated__/ArtistViewQuery.graphql";
import { Artist_artistById$key } from "./__generated__/Artist_artistById.graphql";

const artistViewQuery = graphql`
  query ArtistViewQuery($artist_id: String) {
    ...Artist_artistById @arguments(artist_id: $artist_id)
  }
`;

const artistPaginationQuery = graphql`
  fragment Artist_artistById on Query
  @argumentDefinitions(
    artist_id: { type: "String" }
    count: { type: "Int", defaultValue: 30 }
    cursor: { type: "String" }
  )
  @refetchable(queryName: "ArtistPaginationQuery") {
    artistById(id: $artist_id, first: $count, after: $cursor) {
      name
      songs(first: $count, after: $cursor)
        @connection(key: "ArtistPagination_songs") {
        edges {
          node {
            id
            name
            nameYomi
          }
        }
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

  const queryData = useLazyLoadQuery<ArtistViewQuery>(artistViewQuery, {
    artist_id: id,
  });

  const { data, hasNext, loadNext, isLoadingNext } = usePaginationFragment<
    ArtistPaginationQuery,
    Artist_artistById$key
  >(artistPaginationQuery, queryData);

  return (
    <>
      <div className="card">
        <div className="card-content">
          <h5>{data.artistById.name}</h5>
          <p>{data.artistById.songs.edges.length} songs</p>
        </div>
      </div>
      <div className="collection">
        {data.artistById.songs.edges
          .map((edge) => edge.node)
          .map((song) => (
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
      <div className="row center">
        {hasNext ? (
          <button
            className="btn-large"
            disabled={isLoadingNext}
            onClick={() => loadNext(30)}
          >
            More
          </button>
        ) : (
          <p>No more results.</p>
        )}
      </div>
    </>
  );
};

export default withLoader(Artist);
