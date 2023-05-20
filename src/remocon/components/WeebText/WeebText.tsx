import React from "react";
import { isRomaji, toRomaji } from "wanakana";

import * as styles from "./WeebText.module.scss";

interface Props {
  bold?: boolean;
  text: string;
  yomi: string;
}

const WeebText = ({ bold, text, yomi }: Props) => (
  <span>
    <span className={bold ? styles.bold : undefined}>{text}</span>
    {isRomaji(text) ? null : (
      <span className={styles.romaji}> {toRomaji(yomi)}</span>
    )}
  </span>
);

export default WeebText;
