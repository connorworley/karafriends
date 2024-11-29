import React, { useState } from "react";
import { useParams } from "react-router";

import DebouncedInput from "../components/DebouncedInput";
import JoysoundArtistSearchResults from "../components/JoysoundArtistSearchResults";
import SearchFormWrapper from "../components/SearchFormWrapper";

type JoysoundArtistSearchParams = {
  query: string;
};

const JoysoundArtistSearchPage = () => {
  const params = useParams<JoysoundArtistSearchParams>();
  const [query, setQuery] = useState<string | null>(params.query || null);

  return (
    <SearchFormWrapper>
      <h2>Search by artist name</h2>
      <DebouncedInput
        period={500}
        placeholder="Start typing..."
        onChange={(e) => {
          setQuery(e.target.value === "" ? null : e.target.value);
          history.replaceState(
            {},
            "",
            `#/search/joysoundArtist/${e.target.value}`,
          );
        }}
        defaultValue={params.query}
      />
      <JoysoundArtistSearchResults query={query} />
    </SearchFormWrapper>
  );
};

export default JoysoundArtistSearchPage;
