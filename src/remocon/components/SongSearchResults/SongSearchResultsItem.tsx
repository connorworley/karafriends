import React from "react";
import { Link } from "react-router-dom";

import { ListItem } from "../List";
import WeebText from "../WeebText";
import { SongSearchResults_songsByName } from "./__generated__/SongSearchResults_songsByName.graphql";

type Props = SongSearchResults_songsByName["songsByName"]["edges"][0]["node"];

const SongSearchResultsItem = ({
  id,
  name,
  nameYomi,
  artistName,
  artistNameYomi,
}: Props) => (
  <Link to={`/song/${id}`}>
    <ListItem>
      <div>
        <WeebText bold text={name} yomi={nameYomi} />
      </div>
      <div>
        <WeebText text={artistName} yomi={artistNameYomi} />
      </div>
    </ListItem>
  </Link>
);

export default SongSearchResultsItem;
