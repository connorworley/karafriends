import React, { useState } from "react";
import { useParams } from "react-router";

import DebouncedInput from "../components/DebouncedInput";
import JoysoundSongSearchResults from "../components/JoysoundSongSearchResults";
import SearchFormWrapper from "../components/SearchFormWrapper";

type SongSearchParams = {
  query: string;
};

function JoysoundSongSearchPage() {
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
          history.replaceState(
            {},
            "",
            `#/search/joysoundSong/${e.target.value}`,
          );
        }}
        defaultValue={params.query}
      />
      <JoysoundSongSearchResults query={query} />
    </SearchFormWrapper>
  );
}

export default JoysoundSongSearchPage;
