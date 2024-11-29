import React from "react";
import { useParams } from "react-router";

import JoysoundArtist from "../components/JoysoundArtist";

type RouteParams = {
  id: string;
};

const JoysoundArtistPage = () => {
  const params = useParams<RouteParams>();
  return <JoysoundArtist id={params.id!} />;
};

export default JoysoundArtistPage;
