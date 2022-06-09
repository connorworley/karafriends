import React from "react";
import { Link } from "react-router-dom";
import { isRomaji, toRomaji } from "wanakana";

import styles from "./Artist.module.scss";
import { Artist_artistById } from "./__generated__/Artist_artistById.graphql";

type Props = Artist_artistById["artistById"]["songs"]["edges"][0]["node"];

const ArtistSongItem = ({ id, name, nameYomi }: Props) => (
  <Link to={`/song/${id}`}>
    <div className={styles.listItem}>
      <span className={styles.title}>{name}</span>
      {isRomaji(name) ? null : (
        <span className={styles.romaji}> {toRomaji(nameYomi)}</span>
      )}
    </div>
  </Link>
);

export default ArtistSongItem;
