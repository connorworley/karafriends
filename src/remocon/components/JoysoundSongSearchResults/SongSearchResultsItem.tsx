import React from "react";
import { Link } from "react-router";

import { ListItem } from "../List";
import { JoysoundSongSearchResults_joysoundSongsByKeyword$data } from "./__generated__/JoysoundSongSearchResults_joysoundSongsByKeyword.graphql";

type Props =
  JoysoundSongSearchResults_joysoundSongsByKeyword$data["joysoundSongsByKeyword"]["edges"][0]["node"];

const SongSearchResultsItem = ({ id, name, artistName }: Props) => (
  <Link to={`/joysoundSong/${id}`}>
    <ListItem>
      <div>
        <strong>{name}</strong>
      </div>
      <div>{artistName}</div>
    </ListItem>
  </Link>
);

export default SongSearchResultsItem;
