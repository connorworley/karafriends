import React from "react";
import { Link } from "react-router";

import { ListItem } from "../List";
import WeebText from "../WeebText";
import * as styles from "./ArtistSearchResults.module.scss";
import { ArtistSearchResults_artistsByName$data } from "./__generated__/ArtistSearchResults_artistsByName.graphql";

type Props =
  ArtistSearchResults_artistsByName$data["artistsByName"]["edges"][0]["node"];

const ArtistSearchResultsItem = ({ id, name, nameYomi, songCount }: Props) => (
  <Link to={`/artist/${id}`}>
    <ListItem>
      <WeebText bold text={name} yomi={nameYomi} />
      <span className={styles.songCount}>
        {songCount} {songCount === 1 ? "song" : "songs"}
      </span>
    </ListItem>
  </Link>
);

export default ArtistSearchResultsItem;
