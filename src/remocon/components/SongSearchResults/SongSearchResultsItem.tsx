import React from "react";
import { Link } from "react-router-dom";
import { isRomaji, toRomaji } from "wanakana";

import styles from "./SongSearchResults.module.scss";
import { SongSearchResults_songsByName } from "./__generated__/SongSearchResults_songsByName.graphql";

interface Props {
  id: string;
  name: string;
  nameYomi: string;
  artistName: string;
  artistNameYomi: string;
}

const SongSearchResultsItem = ({
  id,
  name,
  nameYomi,
  artistName,
  artistNameYomi,
}: Props) => (
  <Link to={`/song/${id}`}>
    <div className={styles.listItem}>
      <div>
        <span className={styles.title}>{name}</span>
        {isRomaji(name) ? null : (
          <span className={styles.romaji}> {toRomaji(nameYomi)}</span>
        )}
      </div>
      <div>
        <span>{artistName}</span>
        {isRomaji(artistName) ? null : (
          <span className={styles.romaji}> {toRomaji(artistNameYomi)}</span>
        )}
      </div>
    </div>
  </Link>
);

export default SongSearchResultsItem;
