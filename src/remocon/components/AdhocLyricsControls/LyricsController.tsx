import React, { useEffect } from "react";
// tslint:disable-next-line:no-submodule-imports
import { CgTapSingle } from "react-icons/cg";
// tslint:disable-next-line:no-submodule-imports
import { GiSideswipe } from "react-icons/gi";

import * as styles from "./AdhocLyricsControls.module.scss";

interface Props {
  onSendLine: () => void;
}

const LyricsController = ({ onSendLine }: Props) => {
  return (
    <div className={styles.controller} onClick={onSendLine}>
      <div>
        <strong>TAP HERE</strong> <CgTapSingle /> to send lyrics.
      </div>
    </div>
  );
};

export default LyricsController;
