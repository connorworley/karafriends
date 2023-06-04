import React, { useEffect } from "react";
// tslint:disable-next-line:no-submodule-imports
import { CgTapSingle } from "react-icons/cg";
// tslint:disable-next-line:no-submodule-imports
import { GiSideswipe } from "react-icons/gi";
import { useSwipeable } from "react-swipeable";

import * as styles from "./AdhocLyricsControls.module.scss";

interface Props {
  onSendLine: () => void;
  onRemoveLine: () => void;
}

const LyricsController = ({ onSendLine, onRemoveLine }: Props) => {
  useEffect(() => {
    const keyHandler = ({ key }: KeyboardEvent) => {
      if (key === "z") onSendLine();
      if (key === "x") onRemoveLine();
    };
    window.addEventListener("keydown", keyHandler);
    return () => window.removeEventListener("keydown", keyHandler);
  }, []);

  const touchHandlers = useSwipeable({
    onTap: onSendLine,
    onSwiped: onRemoveLine,
  });

  return (
    <div className={styles.controller} {...touchHandlers}>
      <div>
        <strong>Tap HERE</strong> <CgTapSingle /> to send selected line.
      </div>
      <div>
        <strong>SwipeE HERE</strong> <GiSideswipe /> to remove oldest line.
      </div>
    </div>
  );
};

export default LyricsController;
