import React from "react";
import { graphql, useLazyLoadQuery, usePaginationFragment } from "react-relay";

import Button from "../Button";
import { List } from "../List";
import { default as Loader, withLoader } from "../Loader";
import JoysoundArtistSearchResultsItem from "./JoysoundArtistSearchResultsItem";
import { JoysoundArtistSearchResultsPaginationQuery } from "./__generated__/JoysoundArtistSearchResultsPaginationQuery.graphql";
import { JoysoundArtistSearchResultsViewQuery } from "./__generated__/JoysoundArtistSearchResultsViewQuery.graphql";
import { JoysoundArtistSearchResults_joysoundArtistsByKeyword$key } from "./__generated__/JoysoundArtistSearchResults_joysoundArtistsByKeyword.graphql";

const joysoundArtistSearchResultsViewQuery = graphql`
  query JoysoundArtistSearchResultsViewQuery($keyword: String) {
    ...JoysoundArtistSearchResults_joysoundArtistsByKeyword
      @arguments(keyword: $keyword)
  }
`;

const joysoundArtistSearchResultsPaginationQuery = graphql`
  fragment JoysoundArtistSearchResults_joysoundArtistsByKeyword on Query
  @argumentDefinitions(
    count: { type: "Int", defaultValue: 100 }
    cursor: { type: "String" }
    keyword: { type: "String" }
  )
  @refetchable(queryName: "JoysoundArtistSearchResultsPaginationQuery") {
    joysoundArtistsByKeyword(keyword: $keyword, first: $count, after: $cursor)
      @connection(
        key: "JoysoundArtistSearchResultsPagination_joysoundArtistsByKeyword"
      ) {
      edges {
        node {
          id
          name
        }
      }
    }
  }
`;

interface Props {
  query: string | null;
}

const JoysoundArtistSearchResults = ({ query }: Props) => {
  if (!query) return null;

  const queryData = useLazyLoadQuery<JoysoundArtistSearchResultsViewQuery>(
    joysoundArtistSearchResultsViewQuery,
    { keyword: query }
  );

  const { data, hasNext, loadNext, isLoadingNext } = usePaginationFragment<
    JoysoundArtistSearchResultsPaginationQuery,
    JoysoundArtistSearchResults_joysoundArtistsByKeyword$key
  >(joysoundArtistSearchResultsPaginationQuery, queryData);

  return (
    <>
      {data.joysoundArtistsByKeyword.edges.length === 0 ? (
        <span>No results found</span>
      ) : (
        <List>
          {data.joysoundArtistsByKeyword.edges.map(({ node }) => (
            <JoysoundArtistSearchResultsItem key={node.id} {...node} />
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

export default withLoader(JoysoundArtistSearchResults);
