import classnames from "classnames";
import React from "react";
// tslint:disable-next-line:no-submodule-imports
import { BsPersonSquare } from "react-icons/bs";
// tslint:disable-next-line:no-submodule-imports
import { FaYoutube } from "react-icons/fa";
// tslint:disable-next-line:no-submodule-imports
import { MdMusicVideo } from "react-icons/md";
// tslint:disable-next-line:no-submodule-imports
import { SiNiconico } from "react-icons/si";
import { Link } from "react-router-dom";

import * as styles from "./SearchMethodGrid.module.scss";

const backgroundIcons = {
  song: <MdMusicVideo />,
  artist: <BsPersonSquare />,
  joysoundSong: <MdMusicVideo />,
  joysoundArtist: <BsPersonSquare />,
  youtube: <FaYoutube />,
  niconico: <SiNiconico />,
};

interface Props {
  method:
    | "song"
    | "artist"
    | "joysoundSong"
    | "joysoundArtist"
    | "youtube"
    | "niconico";
  text: string;
}

const SearchMethodGridItem = ({ method, text }: Props) => (
  <div className={styles.gridItem}>
    <Link to={`/search/${method}`}>
      <div className={classnames(styles.button, styles[method])}>
        <span className={styles.icon}>{backgroundIcons[method]}</span>
        <span className={styles.text}>{text}</span>
      </div>
    </Link>
  </div>
);

export default SearchMethodGridItem;
