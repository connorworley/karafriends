import React, { useEffect, useRef, useState } from "react";
import { graphql, QueryRenderer } from "react-relay";
import { RouteComponentProps } from "react-router-dom";

import environment from "../common/graphqlEnvironment";
import { SongSearchQuery } from "./__generated__/SongSearchQuery.graphql";

interface SongParams {
  id: string;
}

interface Props extends RouteComponentProps<SongParams> {}

function SongSearch(props: Props) {
  return <div>{props.match.params.id}</div>;
}
export default SongSearch;
