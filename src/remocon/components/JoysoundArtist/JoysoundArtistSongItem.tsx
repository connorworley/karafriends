import React from "react";
import { Link } from "react-router-dom";

import { ListItem } from "../List";
import { JoysoundArtist_joysoundSongsByArtist } from "./__generated__/JoysoundArtist_joysoundSongsByArtist.graphql";

type Props =
  JoysoundArtist_joysoundSongsByArtist["joysoundSongsByArtist"]["edges"][0]["node"];

const JoysoundArtistSongItem = ({ id, name, artistName }: Props) => (
  <Link to={`/joysoundSong/${id}`}>
    <ListItem>
      <strong>{name}</strong>
    </ListItem>
  </Link>
);

export default JoysoundArtistSongItem;
