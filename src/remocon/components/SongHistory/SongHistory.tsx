import React from "react";
import { graphql, useLazyLoadQuery, usePaginationFragment } from "react-relay";
import { Link } from "react-router-dom";
import { isRomaji, toRomaji } from "wanakana";

import Button from "../Button";
import { List } from "../List";
import { default as Loader, withLoader } from "../Loader";
import styles from "./SongHistory.module.scss";
import SongHistoryItem from "./SongHistoryItem";
import { SongHistoryPaginationQuery } from "./__generated__/SongHistoryPaginationQuery.graphql";
import { SongHistoryViewQuery } from "./__generated__/SongHistoryViewQuery.graphql";
import { SongHistory_history$key } from "./__generated__/SongHistory_history.graphql";

const historyViewQuery = graphql`
  query SongHistoryViewQuery {
    ...SongHistory_history
  }
`;

const historyPaginationQuery = graphql`
  fragment SongHistory_history on Query
  @argumentDefinitions(
    count: { type: "Int", defaultValue: 30 }
    cursor: { type: "String" }
  )
  @refetchable(queryName: "SongHistoryPaginationQuery") {
    history(first: $count, after: $cursor)
      @connection(key: "SongHistoryPagination_history") {
      edges {
        node {
          song {
            id
            name
            nameYomi
            artistName
            artistNameYomi
          }
          playDate
        }
      }
    }
  }
`;

const History = () => {
  const queryData = useLazyLoadQuery<SongHistoryViewQuery>(
    historyViewQuery,
    {}
  );
  const { data, hasNext, loadNext, isLoadingNext } = usePaginationFragment<
    SongHistoryPaginationQuery,
    SongHistory_history$key
  >(historyPaginationQuery, queryData);

  return (
    <div className={styles.history}>
      {data.history.edges.length === 0 ? (
        <span>No history</span>
      ) : (
        <List>
          {data.history.edges.map(({ node }) => (
            <SongHistoryItem
              key={`${node.song.id}_${node.playDate}`}
              {...node}
            />
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

export default withLoader(History);
