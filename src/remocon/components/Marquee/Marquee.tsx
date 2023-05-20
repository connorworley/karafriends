import React from "react";

import * as styles from "./Marquee.module.scss";

interface Props {
  children: React.ReactNode;
}

const Marquee = ({ children }: Props) => (
  <div className={styles.marquee}>
    <div className={styles.track}>
      {children}
      {children}
      {children}
      {children}
      {children}
      {children}
      {children}
      {children}
      {children}
      {children}
      {children}
      {children}
      {children}
      {children}
      {children}
      {children}
    </div>
  </div>
);

export default Marquee;
