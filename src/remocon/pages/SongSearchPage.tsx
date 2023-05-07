import React, { useState } from "react";
import { useParams } from "react-router-dom";

import DebouncedInput from "../components/DebouncedInput";
import SearchFormWrapper from "../components/SearchFormWrapper";
import SongSearchResults from "../components/SongSearchResults";

type SongSearchParams = {
  query: string;
};

function SongSearch() {
  const params = useParams<SongSearchParams>();
  const [query, setQuery] = useState<string | null>(params.query || null);

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
        defaultValue={params.query}
      />
      <SongSearchResults query={query} />
    </SearchFormWrapper>
  );
}

export default SongSearch;
