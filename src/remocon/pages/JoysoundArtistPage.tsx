import React from "react";
import { RouteComponentProps } from "react-router-dom";

import JoysoundArtist from "../components/JoysoundArtist";

interface RouteParams {
  id: string;
}

interface Props extends RouteComponentProps<RouteParams> {}

const JoysoundArtistPage = ({ match }: Props) => (
  <JoysoundArtist id={match.params.id} />
);

export default JoysoundArtistPage;
