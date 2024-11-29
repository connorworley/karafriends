import React from "react";
import { useParams } from "react-router";

import Artist from "../components/Artist";

type RouteParams = {
  id: string;
};

const ArtistPage = () => {
  const params = useParams<RouteParams>();
  return <Artist id={params.id!} />;
};

export default ArtistPage;
