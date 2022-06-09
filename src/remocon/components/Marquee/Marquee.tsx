import classnames from "classnames";
import React from "react";

import styles from "./Marquee.module.scss";

interface Props {
  children: React.ReactNode;
  className: string;
}

const Marquee = ({ children, className }: Props) => (
  <div className={classnames(styles.marquee, className)}>
    <div className={styles.track}>
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
