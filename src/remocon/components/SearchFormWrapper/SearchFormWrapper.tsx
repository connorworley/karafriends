import React from "react";

import * as styles from "./SearchFormWrapper.module.scss";

interface Props {
  children: React.ReactNode;
}

const SearchFormWrapper = ({ children }: Props) => (
  <div className={styles.searchForm}>{children}</div>
);

export default SearchFormWrapper;
