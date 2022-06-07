import React from "react";
import { Link } from "react-router-dom";

import styles from "./SearchMethodsGrid.module.scss";

const SearchMethodsGrid = () => (
  <div className={styles.grid}>
    <Link to="/search/song">Search by song title</Link>
    <Link to="/search/artist">Search by artist name</Link>
    <Link to="/search/youtube">Add YouTube video</Link>
    <Link to="/search/niconico">Add Niconico video</Link>
  </div>
);

export default SearchMethodsGrid;
