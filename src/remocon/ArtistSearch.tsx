import React, { useState } from "react";
import { graphql, QueryRenderer } from "react-relay";
import { Link } from "react-router-dom";

import Loader from "../common/components/Loader";
import environment from "../common/graphqlEnvironment";
import DebouncedInput from "./components/DebouncedInput";
import { ArtistSearchQuery } from "./__generated__/ArtistSearchQuery.graphql";

const artistSearchQuery = graphql`
  query ArtistSearchQuery($name: String) {
    artistsByName(name: $name) {
      id
      name
    }
  }
`;

const ArtistSearch = () => {
  const [searchQuery, setSearchQuery] = useState<string | null>(null);

  return (
    <>
      <h5>Searching by artist name</h5>
      <DebouncedInput
        period={500}
        onChange={(e) =>
          setSearchQuery(e.target.value === "" ? null : e.target.value)
        }
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
                  to={`/artist/${artist.id}`}
                >
                  {artist.name}
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
