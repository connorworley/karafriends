import React from "react";
import { Link } from "react-router-dom";

import styles from "./SearchMethodGrid.module.scss";
import SearchMethodGridItem from "./SearchMethodGridItem";

const SearchMethodGrid = () => (
  <div className={styles.container}>
    <h2>Find a song</h2>
    <div className={styles.grid}>
      <SearchMethodGridItem method="song" text="Title" />
      <SearchMethodGridItem method="artist" text="Artist" />
      <SearchMethodGridItem method="youtube" text="YouTube" />
      <SearchMethodGridItem method="niconico" text="Niconico" />
    </div>
  </div>
);

export default SearchMethodGrid;
