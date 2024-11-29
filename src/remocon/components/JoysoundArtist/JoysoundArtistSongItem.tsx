import React from "react";
import { Link } from "react-router";

import { ListItem } from "../List";
import { JoysoundArtist_joysoundSongsByArtist$data } from "./__generated__/JoysoundArtist_joysoundSongsByArtist.graphql";

type Props =
  JoysoundArtist_joysoundSongsByArtist$data["joysoundSongsByArtist"]["edges"][0]["node"];

const JoysoundArtistSongItem = ({ id, name, artistName }: Props) => (
  <Link to={`/joysoundSong/${id}`}>
    <ListItem>
      <strong>{name}</strong>
    </ListItem>
  </Link>
);

export default JoysoundArtistSongItem;
