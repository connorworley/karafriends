import React from "react";

import styles from "./List.module.scss";

interface Props {
  children: React.ReactNode;
}

const List = ({ children }: Props) => (
  <div className={styles.list}>{children}</div>
);

export default List;
