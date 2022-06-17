import React from "react";
import { RouteComponentProps } from "react-router-dom";

import AdhocLyricsControls from "../components/AdhocLyricsControls";

interface RouteParams {
  id: string;
}

interface Props extends RouteComponentProps<RouteParams> {}

const AdhocLyricsPage = (props: Props) => (
  <AdhocLyricsControls id={props.match.params.id} />
);

export default AdhocLyricsPage;
