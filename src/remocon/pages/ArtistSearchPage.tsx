import React, { useState } from "react";
import { RouteComponentProps } from "react-router-dom";

import ArtistSearchResults from "../components/ArtistSearchResults";
import DebouncedInput from "../components/DebouncedInput";
import SearchFormWrapper from "../components/SearchFormWrapper";

interface ArtistSearchParams {
  query: string | undefined;
}

interface Props extends RouteComponentProps<ArtistSearchParams> {}

const ArtistSearchPage = (props: Props) => {
  const [query, setQuery] = useState<string | null>(
    props.match.params.query || null
  );

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
        defaultValue={props.match.params.query}
      />
      <ArtistSearchResults query={query} />
    </SearchFormWrapper>
  );
};

export default ArtistSearchPage;
