import React from "react";
import { graphql, useLazyLoadQuery, usePaginationFragment } from "react-relay";

import Button from "../Button";
import { List } from "../List";
import { default as Loader, withLoader } from "../Loader";
import ArtistSongItem from "./ArtistSongItem";
import { ArtistPaginationQuery } from "./__generated__/ArtistPaginationQuery.graphql";
import { ArtistQuery } from "./__generated__/ArtistQuery.graphql";
import { Artist_artistById$key } from "./__generated__/Artist_artistById.graphql";

const artistPageQuery = graphql`
  query ArtistQuery($artist_id: String) {
    ...Artist_artistById @arguments(artist_id: $artist_id)
  }
`;

const artistPaginationQuery = graphql`
  fragment Artist_artistById on Query
  @argumentDefinitions(
    artist_id: { type: "String" }
    count: { type: "Int", defaultValue: 30 }
    cursor: { type: "String" }
  )
  @refetchable(queryName: "ArtistPaginationQuery") {
    artistById(id: $artist_id, first: $count, after: $cursor) {
      name
      songCount
      songs(first: $count, after: $cursor)
        @connection(key: "ArtistPagination_songs") {
        edges {
          node {
            id
            name
            nameYomi
          }
        }
      }
    }
  }
`;

interface Props {
  id: string;
}

const Artist = ({ id }: Props) => {
  const queryData = useLazyLoadQuery<ArtistQuery>(artistPageQuery, {
    artist_id: id,
  });
  const { data, hasNext, loadNext, isLoadingNext } = usePaginationFragment<
    ArtistPaginationQuery,
    Artist_artistById$key
  >(artistPaginationQuery, queryData);
  const artist = data.artistById;

  return (
    <div>
      <h2>{artist.name}</h2>
      <span>
        {artist.songCount} {artist.songCount === 1 ? "song" : "songs"}
      </span>
      <List>
        {artist.songs.edges.map(({ node }) => (
          <ArtistSongItem key={node.id} {...node} />
        ))}
      </List>
      {isLoadingNext ? (
        <Loader />
      ) : (
        hasNext && (
          <Button full disabled={isLoadingNext} onClick={() => loadNext(30)}>
            More
          </Button>
        )
      )}
    </div>
  );
};

export default withLoader(Artist);
