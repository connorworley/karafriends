import React from "react";

import styles from "./List.module.scss";

interface Props {
  children: React.ReactNode;
}

const ListItem = ({ children }: Props) => (
  <div className={styles.listItem}>{children}</div>
);

export default ListItem;
