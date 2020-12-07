import React, { useEffect, useRef, useState } from "react";
import { graphql, QueryRenderer } from "react-relay";

import environment from "../common/graphqlEnvironment";
import { AppQuery } from "./__generated__/AppQuery.graphql";

function App() {
  const [songName, setSongName] = useState("");

  return (
    <div>
      <input onChange={(e) => setSongName(e.target.value)} />
      <QueryRenderer<AppQuery>
        environment={environment}
        query={graphql`
          query AppQuery($name: String!) {
            songsByName(name: $name) {
              id
              name
            }
          }
        `}
        variables={{
          name: songName,
        }}
        render={({ error, props }) => {
          if (!props) {
            return <div>Loading...</div>;
          }
          return (
            <ul>
              {props.songsByName.map((song) => (
                <li key={song.id}>{song.name}</li>
              ))}
            </ul>
          );
        }}
      />
    </div>
  );
}

export default App;
