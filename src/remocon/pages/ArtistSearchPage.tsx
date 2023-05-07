import React, { useState } from "react";
import { useParams } from "react-router-dom";

import ArtistSearchResults from "../components/ArtistSearchResults";
import DebouncedInput from "../components/DebouncedInput";
import SearchFormWrapper from "../components/SearchFormWrapper";

type ArtistSearchParams = {
  query: string;
};

const ArtistSearchPage = () => {
  const params = useParams<ArtistSearchParams>();
  const [query, setQuery] = useState<string | null>(params.query || null);

  return (
    <SearchFormWrapper>
      <h2>Search by artist name</h2>
      <DebouncedInput
        period={500}
        placeholder="Start typing..."
        onChange={(e) => {
          setQuery(e.target.value === "" ? null : e.target.value);
          history.replaceState({}, "", `#/search/artist/${e.target.value}`);
        }}
        defaultValue={params.query}
      />
      <ArtistSearchResults query={query} />
    </SearchFormWrapper>
  );
};

export default ArtistSearchPage;
