import React from "react";
import { graphql, useLazyLoadQuery, usePaginationFragment } from "react-relay";
import { Link } from "react-router-dom";
import { isRomaji, toRomaji } from "wanakana";

import { withLoader } from "../common/components/Loader";
import { SongSearchResultsPaginationQuery } from "./__generated__/SongSearchResultsPaginationQuery.graphql";
import { SongSearchResultsViewQuery } from "./__generated__/SongSearchResultsViewQuery.graphql";
import { SongSearchResults_songsByName$key } from "./__generated__/SongSearchResults_songsByName.graphql";

const songSearchResultsViewQuery = graphql`
  query SongSearchResultsViewQuery($name: String) {
    ...SongSearchResults_songsByName @arguments(name: $name)
  }
`;

const songSearchResultsPaginationQuery = graphql`
  fragment SongSearchResults_songsByName on Query
  @argumentDefinitions(
    count: { type: "Int", defaultValue: 30 }
    cursor: { type: "String" }
    name: { type: "String" }
  )
  @refetchable(queryName: "SongSearchResultsPaginationQuery") {
    songsByName(name: $name, first: $count, after: $cursor)
      @connection(key: "SongSearchResultsPagination_songsByName") {
      edges {
        node {
          id
          name
          nameYomi
          artistName
          artistNameYomi
        }
      }
    }
  }
`;

function SongSearchResults(props: { songName: string | null }) {
  if (!props.songName) return null;

  const queryData = useLazyLoadQuery<SongSearchResultsViewQuery>(
    songSearchResultsViewQuery,
    { name: props.songName }
  );

  const { data, hasNext, loadNext, isLoadingNext } = usePaginationFragment<
    SongSearchResultsPaginationQuery,
    SongSearchResults_songsByName$key
  >(songSearchResultsPaginationQuery, queryData);

  return (
    <div>
      <div className="collection">
        {data.songsByName.edges
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
              <br />
              {song.artistName}{" "}
              {isRomaji(song.artistName) ? null : (
                <span className="grey-text text-lighten-2">
                  {toRomaji(song.artistNameYomi)}
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
    </div>
  );
}

export default withLoader(SongSearchResults);
