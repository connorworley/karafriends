import React from "react";
import { RouteComponentProps } from "react-router-dom";

import Artist from "../components/Artist";

interface RouteParams {
  id: string;
}

interface Props extends RouteComponentProps<RouteParams> {}

const ArtistPage = ({ match }: Props) => <Artist id={match.params.id} />;

export default ArtistPage;
