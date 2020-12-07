import React, { useEffect, useRef, useState } from "react";
import { graphql, QueryRenderer } from "react-relay";
import { Link } from "react-router-dom";

import environment from "../common/graphqlEnvironment";
import { SongSearchQuery } from "./__generated__/SongSearchQuery.graphql";

function SongSearch() {
  const [songName, setSongName] = useState<string | null>(null);

  return (
    <div>
      <input
        onChange={(e) =>
          setSongName(e.target.value === "" ? null : e.target.value)
        }
      />
      <QueryRenderer<SongSearchQuery>
        environment={environment}
        query={graphql`
          query SongSearchQuery($name: String) {
            songsByName(name: $name) {
              id
              name
              artistName
            }
          }
        `}
        variables={{
          name: songName,
        }}
        render={({ error, props }) => {
          if (songName === null) {
            return;
          }
          if (!props) {
            return <div>Loading...</div>;
          }
          return (
            <div className="collection">
              {props.songsByName.map((song) => (
                <Link
                  to={`/song/${song.id}`}
                  className="collection-item"
                  key={song.id}
                >
                  {song.name}
                  <br />
                  {song.artistName}
                </Link>
              ))}
            </div>
          );
        }}
      />
    </div>
  );
}
export default SongSearch;
