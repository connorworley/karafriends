import React, { useState } from "react";
import { RouteComponentProps } from "react-router-dom";

import DebouncedInput from "./components/DebouncedInput";
import SongSearchResults from "./SongSearchResults";

interface SongSearchParams {
  query: string | undefined;
}

interface Props extends RouteComponentProps<SongSearchParams> {}

function SongSearch(props: Props) {
  const [songName, setSongName] = useState<string | null>(
    props.match.params.query || null
  );
  return (
    <div>
      <h5>Searching by song title</h5>
      <DebouncedInput
        period={500}
        onChange={(e) => {
          setSongName(e.target.value === "" ? null : e.target.value);
          history.replaceState({}, "", `#/search/song/${e.target.value}`);
        }}
        defaultValue={props.match.params.query}
      />
      <SongSearchResults songName={songName} />
    </div>
  );
}

export default SongSearch;
