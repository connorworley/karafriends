import React, { useEffect } from "react";
// tslint:disable-next-line:no-submodule-imports
import { CgTapSingle } from "react-icons/cg";
// tslint:disable-next-line:no-submodule-imports
import { GiSideswipe } from "react-icons/gi";
import { useSwipeable } from "react-swipeable";

import styles from "./AdhocLyricsControls.module.scss";

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
        Tap <CgTapSingle /> or press "z" to send selected line
      </div>
      <div>
        Swipe <GiSideswipe /> or press "x" to remove oldest line
      </div>
    </div>
  );
};

export default LyricsController;
