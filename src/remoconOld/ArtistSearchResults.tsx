import React from "react";
import { graphql, useLazyLoadQuery, usePaginationFragment } from "react-relay";
import { Link } from "react-router-dom";
import { isRomaji, toRomaji } from "wanakana";

import { withLoader } from "../common/components/Loader";
import { ArtistSearchResultsPaginationQuery } from "./__generated__/ArtistSearchResultsPaginationQuery.graphql";
import { ArtistSearchResultsViewQuery } from "./__generated__/ArtistSearchResultsViewQuery.graphql";
import { ArtistSearchResults_artistsByName$key } from "./__generated__/ArtistSearchResults_artistsByName.graphql";

const artistSearchResultsViewQuery = graphql`
  query ArtistSearchResultsViewQuery($name: String) {
    ...ArtistSearchResults_artistsByName @arguments(name: $name)
  }
`;

const artistSearchResultsPaginationQuery = graphql`
  fragment ArtistSearchResults_artistsByName on Query
  @argumentDefinitions(
    count: { type: "Int", defaultValue: 30 }
    cursor: { type: "String" }
    name: { type: "String" }
  )
  @refetchable(queryName: "ArtistSearchResultsPaginationQuery") {
    artistsByName(name: $name, first: $count, after: $cursor)
      @connection(key: "ArtistSearchResultsPagination_artistsByName") {
      edges {
        node {
          id
          name
          nameYomi
          songCount
        }
      }
    }
  }
`;

function ArtistSearchResults(props: { artistName: string | null }) {
  if (!props.artistName) return null;

  const queryData = useLazyLoadQuery<ArtistSearchResultsViewQuery>(
    artistSearchResultsViewQuery,
    { name: props.artistName }
  );

  const { data, hasNext, loadNext, isLoadingNext } = usePaginationFragment<
    ArtistSearchResultsPaginationQuery,
    ArtistSearchResults_artistsByName$key
  >(artistSearchResultsPaginationQuery, queryData);

  return (
    <div>
      <div className="collection">
        {data.artistsByName.edges
          .map((edge) => edge.node)
          .map((artist) => (
            <Link
              key={artist.id}
              className="collection-item"
              style={{ display: "flex" }}
              to={`/artist/${artist.id}`}
            >
              <span className="truncate" style={{ flex: 1 }}>
                {artist.name}{" "}
                {isRomaji(artist.name) ? null : (
                  <span className="grey-text text-lighten-2">
                    {toRomaji(artist.nameYomi)}
                  </span>
                )}
              </span>
              <span>{artist.songCount} songs</span>
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

export default withLoader(ArtistSearchResults);
