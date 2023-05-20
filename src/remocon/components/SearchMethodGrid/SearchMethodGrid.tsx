import React from "react";

import * as styles from "./SearchMethodGrid.module.scss";
import SearchMethodGridItem from "./SearchMethodGridItem";

const SearchMethodGrid = () => (
  <div>
    <h2>Find a song</h2>
    <div className={styles.grid}>
      <SearchMethodGridItem method="joysoundSong" text="Title (Joysound)" />
      <SearchMethodGridItem method="joysoundArtist" text="Artist (Joysound)" />
      <SearchMethodGridItem method="song" text="Title (DAM)" />
      <SearchMethodGridItem method="artist" text="Artist (DAM)" />
      <SearchMethodGridItem method="youtube" text="YouTube" />
      <SearchMethodGridItem method="niconico" text="Niconico" />
    </div>
  </div>
);

export default SearchMethodGrid;
