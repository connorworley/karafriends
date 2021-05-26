import React from "react";
import { graphql, useLazyLoadQuery, usePaginationFragment } from "react-relay";
import { Link } from "react-router-dom";
import { isRomaji, toRomaji } from "wanakana";

import { withLoader } from "../common/components/Loader";
import { HistoryPaginationQuery } from "./__generated__/HistoryPaginationQuery.graphql";
import { HistoryViewQuery } from "./__generated__/HistoryViewQuery.graphql";
import { History_history$key } from "./__generated__/History_history.graphql";

const historyViewQuery = graphql`
  query HistoryViewQuery {
    ...History_history
  }
`;

const historysPaginationQuery = graphql`
  fragment History_history on Query
  @argumentDefinitions(
    count: { type: "Int", defaultValue: 30 }
    cursor: { type: "String" }
  )
  @refetchable(queryName: "HistoryPaginationQuery") {
    history(first: $count, after: $cursor)
      @connection(key: "HistoryPagination_history") {
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

function History() {
  const queryData = useLazyLoadQuery<HistoryViewQuery>(historyViewQuery, {});
  const { data, hasNext, loadNext, isLoadingNext } = usePaginationFragment<
    HistoryPaginationQuery,
    History_history$key
  >(historysPaginationQuery, queryData);

  return (
    <div>
      <div className="collection">
        {data.history.edges
          .map((edge) => edge.node)
          .map(({ song, playDate }, i) => {
            const [year, month, day, hour, minute, second] = playDate
              .match(/(....)(..)(..)(..)(..)(..)/)!
              .slice(1);
            // Convert to a UTC Date
            const date = new Date(
              `${year}-${month}-${day}T${hour}:${minute}:${second}.000+09:00`
            );
            return (
              <Link
                to={`/song/${song.id}`}
                className="collection-item"
                key={`${song.id}_${playDate}`}
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
                <span className="secondary-content">
                  {date.toLocaleString()}
                </span>
              </Link>
            );
          })}
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

export default withLoader(History);
