import React, { useState } from "react";
import { RouteComponentProps } from "react-router-dom";

import DebouncedInput from "../components/DebouncedInput";
import SearchFormWrapper from "../components/SearchFormWrapper";
import SongSearchResults from "../components/SongSearchResults";

interface SongSearchParams {
  query: string | undefined;
}

interface Props extends RouteComponentProps<SongSearchParams> {}

function SongSearch(props: Props) {
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
          history.replaceState({}, "", `#/search/song/${e.target.value}`);
        }}
        defaultValue={props.match.params.query}
      />
      <SongSearchResults query={query} />
    </SearchFormWrapper>
  );
}

export default SongSearch;
