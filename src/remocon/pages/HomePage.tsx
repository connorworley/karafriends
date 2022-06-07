import React from "react";
import { RouteComponentProps } from "react-router-dom";

import SearchMethodsGrid from "../components/SearchMethodsGrid";

const HomePage = (props: RouteComponentProps) => (
  <>
    <SearchMethodsGrid />
  </>
);

export default HomePage;
