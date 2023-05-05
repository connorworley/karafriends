import React, { useState } from "react";
import { RouteComponentProps } from "react-router-dom";

import DebouncedInput from "../components/DebouncedInput";
import JoysoundArtistSearchResults from "../components/JoysoundArtistSearchResults";
import SearchFormWrapper from "../components/SearchFormWrapper";

interface JoysoundArtistSearchParams {
  query: string | undefined;
}

interface Props extends RouteComponentProps<JoysoundArtistSearchParams> {}

const JoysoundArtistSearchPage = (props: Props) => {
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
          history.replaceState(
            {},
            "",
            `#/search/joysoundArtist/${e.target.value}`
          );
        }}
        defaultValue={props.match.params.query}
      />
      <JoysoundArtistSearchResults query={query} />
    </SearchFormWrapper>
  );
};

export default JoysoundArtistSearchPage;
