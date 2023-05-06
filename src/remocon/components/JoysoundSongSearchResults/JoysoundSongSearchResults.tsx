import React from "react";
import { graphql, useLazyLoadQuery, usePaginationFragment } from "react-relay";
import { Link } from "react-router-dom";

import Button from "../Button";
import { List } from "../List";
import { default as Loader, withLoader } from "../Loader";
import SongSearchResultsItem from "./SongSearchResultsItem";
import { JoysoundSongSearchResultsPaginationQuery } from "./__generated__/JoysoundSongSearchResultsPaginationQuery.graphql";
import { JoysoundSongSearchResultsViewQuery } from "./__generated__/JoysoundSongSearchResultsViewQuery.graphql";
import { JoysoundSongSearchResults_joysoundSongsByKeyword$key } from "./__generated__/JoysoundSongSearchResults_joysoundSongsByKeyword.graphql";

const joysoundSongSearchResultsViewQuery = graphql`
  query JoysoundSongSearchResultsViewQuery($keyword: String) {
    ...JoysoundSongSearchResults_joysoundSongsByKeyword
      @arguments(keyword: $keyword)
  }
`;

const joysoundSongSearchResultsPaginationQuery = graphql`
  fragment JoysoundSongSearchResults_joysoundSongsByKeyword on Query
  @argumentDefinitions(
    count: { type: "Int", defaultValue: 100 }
    cursor: { type: "String" }
    keyword: { type: "String" }
  )
  @refetchable(queryName: "JoysoundSongSearchResultsPaginationQuery") {
    joysoundSongsByKeyword(keyword: $keyword, first: $count, after: $cursor)
      @connection(
        key: "JoysoundSongSearchResultsPagination_joysoundSongsByKeyword"
      ) {
      edges {
        node {
          id
          name
          artistName
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

  const queryData = useLazyLoadQuery<JoysoundSongSearchResultsViewQuery>(
    joysoundSongSearchResultsViewQuery,
    { keyword: query }
  );

  const { data, hasNext, loadNext, isLoadingNext } = usePaginationFragment<
    JoysoundSongSearchResultsPaginationQuery,
    JoysoundSongSearchResults_joysoundSongsByKeyword$key
  >(joysoundSongSearchResultsPaginationQuery, queryData);

  return (
    <>
      {data.joysoundSongsByKeyword.edges.length === 0 ? (
        <span>No results found</span>
      ) : (
        <List>
          {data.joysoundSongsByKeyword.edges.map(({ node }) => (
            <SongSearchResultsItem key={node.id} {...node} />
          ))}
        </List>
      )}
      {isLoadingNext ? (
        <Loader />
      ) : (
        hasNext && (
          <Button full disabled={isLoadingNext} onClick={() => loadNext(100)}>
            More
          </Button>
        )
      )}
    </>
  );
};

export default withLoader(SongSearchResults);
