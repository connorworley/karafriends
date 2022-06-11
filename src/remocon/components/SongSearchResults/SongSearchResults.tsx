import React from "react";
import { graphql, useLazyLoadQuery, usePaginationFragment } from "react-relay";
import { Link } from "react-router-dom";

import Button from "../Button";
import { List } from "../List";
import { default as Loader, withLoader } from "../Loader";
import SongSearchResultsItem from "./SongSearchResultsItem";
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

interface Props {
  query: string | null;
}

const SongSearchResults = ({ query }: Props) => {
  if (!query) return null;

  const queryData = useLazyLoadQuery<SongSearchResultsViewQuery>(
    songSearchResultsViewQuery,
    { name: query }
  );

  const { data, hasNext, loadNext, isLoadingNext } = usePaginationFragment<
    SongSearchResultsPaginationQuery,
    SongSearchResults_songsByName$key
  >(songSearchResultsPaginationQuery, queryData);

  return (
    <>
      {data.songsByName.edges.length === 0 ? (
        <span>No results found</span>
      ) : (
        <List>
          {data.songsByName.edges.map(({ node }) => (
            <SongSearchResultsItem key={node.id} {...node} />
          ))}
        </List>
      )}
      {isLoadingNext ? (
        <Loader />
      ) : (
        hasNext && (
          <Button full disabled={isLoadingNext} onClick={() => loadNext(30)}>
            More
          </Button>
        )
      )}
    </>
  );
};

export default withLoader(SongSearchResults);
