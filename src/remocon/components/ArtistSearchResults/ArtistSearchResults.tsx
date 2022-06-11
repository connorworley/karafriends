import React from "react";
import { graphql, useLazyLoadQuery, usePaginationFragment } from "react-relay";
import { Link } from "react-router-dom";

import Button from "../Button";
import { List } from "../List";
import { default as Loader, withLoader } from "../Loader";
import styles from "./ArtistSearchResults.module.scss";
import ArtistSearchResultsItem from "./ArtistSearchResultsItem";
import { ArtistSearchResultsPaginationQuery } from "./__generated__/ArtistSearchResultsPaginationQuery.graphql";
import { ArtistSearchResultsViewQuery } from "./__generated__/ArtistSearchResultsViewQuery.graphql";
import { ArtistSearchResults_artistsByName$key } from "./__generated__/ArtistSearchResults_artistsByName.graphql";

const artistSearchResultsViewQuery = graphql`
  query ArtistSearchResultsViewQuery($name: String) {
    ...ArtistSearchResults_artistsByName @arguments(name: $name)
  }
`;

const songSearchResultsPaginationQuery = graphql`
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

interface Props {
  query: string | null;
}

const ArtistSearchResults = ({ query }: Props) => {
  if (!query) return null;

  const queryData = useLazyLoadQuery<ArtistSearchResultsViewQuery>(
    artistSearchResultsViewQuery,
    { name: query }
  );

  const { data, hasNext, loadNext, isLoadingNext } = usePaginationFragment<
    ArtistSearchResultsPaginationQuery,
    ArtistSearchResults_artistsByName$key
  >(songSearchResultsPaginationQuery, queryData);

  return (
    <div className={styles.results}>
      {data.artistsByName.edges.length === 0 ? (
        <span>No results found</span>
      ) : (
        <List>
          {data.artistsByName.edges.map(({ node }) => (
            <ArtistSearchResultsItem key={node.id} {...node} />
          ))}
        </List>
      )}
      {isLoadingNext ? (
        <Loader />
      ) : (
        hasNext && (
          <Button
            className={styles.moreButton}
            disabled={isLoadingNext}
            onClick={() => loadNext(30)}
          >
            More
          </Button>
        )
      )}
    </div>
  );
};

export default withLoader(ArtistSearchResults);
