import React from "react";
import { useParams } from "react-router-dom";

import AdhocLyricsControls from "../components/AdhocLyricsControls";

type RouteParams = {
  id: string;
};

const AdhocLyricsPage = () => {
  const params = useParams<RouteParams>();
  return <AdhocLyricsControls id={params.id!} />;
};

export default AdhocLyricsPage;
