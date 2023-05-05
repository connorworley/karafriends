import React, { useState } from "react";
import { RouteComponentProps } from "react-router-dom";

import DebouncedInput from "../components/DebouncedInput";
import JoysoundSongSearchResults from "../components/JoysoundSongSearchResults";
import SearchFormWrapper from "../components/SearchFormWrapper";

interface SongSearchParams {
  query: string | undefined;
}

interface Props extends RouteComponentProps<SongSearchParams> {}

function JoysoundSongSearchPage(props: Props) {
  const [query, setQuery] = useState<string | null>(
    props.match.params.query || null
  );

  return (
    <SearchFormWrapper>
      <h2>Search by song title</h2>
      <DebouncedInput
        period={500}
        placeholder="Start typing..."
        onChange={(e) => {
          setQuery(e.target.value === "" ? null : e.target.value);
          history.replaceState(
            {},
            "",
            `#/search/joysoundSong/${e.target.value}`
          );
        }}
        defaultValue={props.match.params.query}
      />
      <JoysoundSongSearchResults query={query} />
    </SearchFormWrapper>
  );
}

export default JoysoundSongSearchPage;
