import classnames from "classnames";
import React from "react";

import usePitchShiftSemis from "../../../common/hooks/usePitchShiftSemis";
import * as styles from "./PitchControls.module.scss";

const PitchControls = (props: { disabled: boolean }) => {
  const { pitchShiftSemis, setPitchShiftSemis } = usePitchShiftSemis();

  return (
    <div
      className={classnames(styles.controls, {
        [styles.disabled]: props.disabled,
      })}
    >
      <div
        className={styles.symbol}
        onClick={() => setPitchShiftSemis(pitchShiftSemis - 1)}
      >
        ♭
      </div>
      <div className={styles.display}>{pitchShiftSemis}</div>
      <div
        className={styles.symbol}
        onClick={() => setPitchShiftSemis(pitchShiftSemis + 1)}
      >
        ♯
      </div>
    </div>
  );
};

export default PitchControls;
