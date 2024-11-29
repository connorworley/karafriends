import React from "react";
import { Link } from "react-router";

import { ListItem } from "../List";
import * as styles from "./JoysoundArtistSearchResults.module.scss";
import { JoysoundArtistSearchResults_joysoundArtistsByKeyword$data } from "./__generated__/JoysoundArtistSearchResults_joysoundArtistsByKeyword.graphql";

type Props =
  JoysoundArtistSearchResults_joysoundArtistsByKeyword$data["joysoundArtistsByKeyword"]["edges"][0]["node"];

const JoysoundArtistSearchResultsItem = ({ id, name }: Props) => (
  <Link to={`/joysoundArtist/${id}`}>
    <ListItem>
      <strong>{name}</strong>
    </ListItem>
  </Link>
);

export default JoysoundArtistSearchResultsItem;
