import React from "react";
// tslint:disable-next-line:no-submodule-imports
import { BsMusicNoteBeamed } from "react-icons/bs";

import styles from "./ControlBar.module.scss";

const ControlBar = () => {
  return (
    <div className={styles.controlBar}>
      <BsMusicNoteBeamed />
    </div>
  );
};

export default ControlBar;
