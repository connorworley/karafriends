import React from "react";
import { graphql, useLazyLoadQuery, usePaginationFragment } from "react-relay";
import { invariant } from "ts-invariant";

import Button from "../Button";
import { List } from "../List";
import { default as Loader, withLoader } from "../Loader";
import SongHistoryItem from "./SongHistoryItem";
import { SongHistoryPaginationQuery } from "./__generated__/SongHistoryPaginationQuery.graphql";
import { SongHistoryViewQuery } from "./__generated__/SongHistoryViewQuery.graphql";
import { SongHistory_songHistory$key } from "./__generated__/SongHistory_songHistory.graphql";

const historyViewQuery = graphql`
  query SongHistoryViewQuery {
    ...SongHistory_songHistory
  }
`;

const historyPaginationQuery = graphql`
  fragment SongHistory_songHistory on Query
  @argumentDefinitions(
    count: { type: "Int", defaultValue: 30 }
    cursor: { type: "String" }
  )
  @refetchable(queryName: "SongHistoryPaginationQuery") {
    songHistory(first: $count, after: $cursor)
      @connection(key: "SongHistoryPagination_songHistory") {
      edges {
        node {
          song {
            ... on DamQueueItem {
              __typename
              songId
              name
              artistName
              timestamp
              userIdentity {
                nickname
              }
            }

            ... on JoysoundQueueItem {
              __typename
              songId
              name
              artistName
              timestamp
              userIdentity {
                nickname
              }
            }

            ... on YoutubeQueueItem {
              __typename
              songId
              name
              artistName
              timestamp
              userIdentity {
                nickname
              }
            }

            ... on NicoQueueItem {
              __typename
              songId
              name
              artistName
              timestamp
              userIdentity {
                nickname
              }
            }
          }
        }
      }
    }
  }
`;

const History = () => {
  const queryData = useLazyLoadQuery<SongHistoryViewQuery>(
    historyViewQuery,
    {},
    { fetchPolicy: "store-and-network" }
  );

  const { data, hasNext, loadNext, isLoadingNext } = usePaginationFragment<
    SongHistoryPaginationQuery,
    SongHistory_songHistory$key
  >(historyPaginationQuery, queryData);

  return (
    <>
      {data.songHistory.edges.length === 0 ? (
        <span>No history</span>
      ) : (
        <List>
          {data.songHistory.edges.map(({ node }) => {
            invariant(node.song.__typename !== "%other");

            return (
              <SongHistoryItem
                key={`${node.song.name}_${node.song.timestamp}`}
                {...node}
              />
            );
          })}
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

export default withLoader(History);
