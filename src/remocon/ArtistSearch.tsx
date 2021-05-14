import React, { useState } from "react";
import { graphql, QueryRenderer } from "react-relay";
import { Link, RouteComponentProps } from "react-router-dom";
import { isRomaji, toRomaji } from "wanakana";

import Loader from "../common/components/Loader";
import environment from "../common/graphqlEnvironment";
import DebouncedInput from "./components/DebouncedInput";
import { ArtistSearchQuery } from "./__generated__/ArtistSearchQuery.graphql";

const artistSearchQuery = graphql`
  query ArtistSearchQuery($name: String) {
    artistsByName(name: $name) {
      id
      name
      nameYomi
      songCount
    }
  }
`;

interface ArtistSearchParams {
  query: string | undefined;
}

interface Props extends RouteComponentProps<ArtistSearchParams> {}

const ArtistSearch = (outerProps: Props) => {
  const [searchQuery, setSearchQuery] = useState<string | null>(
    outerProps.match.params.query || null
  );

  return (
    <>
      <h5>Searching by artist name</h5>
      <DebouncedInput
        period={500}
        onChange={(e) => {
          setSearchQuery(e.target.value === "" ? null : e.target.value);
          history.replaceState({}, "", `#/search/artist/${e.target.value}`);
        }}
        defaultValue={outerProps.match.params.query}
      />
      <QueryRenderer<ArtistSearchQuery>
        environment={environment}
        query={artistSearchQuery}
        variables={{ name: searchQuery }}
        render={({ error, props }) => {
          if (searchQuery === null) return null;
          if (!props) return <Loader />;
          return (
            <div className="collection">
              {props.artistsByName.map((artist) => (
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
          );
        }}
      />
    </>
  );
};

export default ArtistSearch;
