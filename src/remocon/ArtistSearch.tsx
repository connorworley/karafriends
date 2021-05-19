import React, { useState } from "react";
import { RouteComponentProps } from "react-router-dom";

import ArtistSearchResults from "./ArtistSearchResults";
import DebouncedInput from "./components/DebouncedInput";

interface ArtistSearchParams {
  query: string | undefined;
}

interface Props extends RouteComponentProps<ArtistSearchParams> {}

const ArtistSearch = (props: Props) => {
  const [searchQuery, setSearchQuery] = useState<string | null>(
    props.match.params.query || null
  );

  return (
    <>
      <h5>Searching by artist name</h5>
      <DebouncedInput
        period={500}
        onChange={(e) => {
          setSearchQuery(e.target.value === "" ? null : e.target.value);
          history.replaceState({}, "", `#/search/artist/${e.target.value}`);
        }}
        defaultValue={props.match.params.query}
      />
      <ArtistSearchResults artistName={searchQuery} />
    </>
  );
};

export default ArtistSearch;
