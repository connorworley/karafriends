import React from "react";
import { graphql, useLazyLoadQuery, usePaginationFragment } from "react-relay";

import Button from "../Button";
import { List } from "../List";
import { default as Loader, withLoader } from "../Loader";
import JoysoundArtistSongItem from "./JoysoundArtistSongItem";
import { JoysoundArtistPaginationQuery } from "./__generated__/JoysoundArtistPaginationQuery.graphql";
import { JoysoundArtistViewQuery } from "./__generated__/JoysoundArtistViewQuery.graphql";
import { JoysoundArtist_joysoundSongsByArtist$key } from "./__generated__/JoysoundArtist_joysoundSongsByArtist.graphql";

const joysoundArtistViewQuery = graphql`
  query JoysoundArtistViewQuery($artistId: String) {
    ...JoysoundArtist_joysoundSongsByArtist @arguments(artistId: $artistId)
  }
`;

const joysoundArtistPaginationQuery = graphql`
  fragment JoysoundArtist_joysoundSongsByArtist on Query
  @argumentDefinitions(
    artistId: { type: "String" }
    count: { type: "Int", defaultValue: 100 }
    cursor: { type: "String" }
  )
  @refetchable(queryName: "JoysoundArtistPaginationQuery") {
    joysoundSongsByArtist(artistId: $artistId, first: $count, after: $cursor)
      @connection(key: "JoysoundArtistPagination_joysoundSongsByArtist") {
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
  id: string;
}

const JoysoundArtist = ({ id }: Props) => {
  const queryData = useLazyLoadQuery<JoysoundArtistViewQuery>(
    joysoundArtistViewQuery,
    {
      artistId: id,
    }
  );

  const { data, hasNext, loadNext, isLoadingNext } = usePaginationFragment<
    JoysoundArtistPaginationQuery,
    JoysoundArtist_joysoundSongsByArtist$key
  >(joysoundArtistPaginationQuery, queryData);

  const songs = data.joysoundSongsByArtist;

  return (
    <div>
      <h2>{songs.edges[0].node.artistName}</h2>
      <List>
        {songs.edges.map(({ node }) => (
          <JoysoundArtistSongItem key={node.id} {...node} />
        ))}
      </List>
      {isLoadingNext ? (
        <Loader />
      ) : (
        hasNext && (
          <Button full disabled={isLoadingNext} onClick={() => loadNext(100)}>
            More
          </Button>
        )
      )}
    </div>
  );
};

export default withLoader(JoysoundArtist);
