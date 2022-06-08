import React from "react";
import { RouteComponentProps } from "react-router-dom";
import SearchMethodGrid from "../components/SearchMethodGrid";

const HomePage = (props: RouteComponentProps) => (
  <>
    <SearchMethodGrid />
  </>
);

export default HomePage;
