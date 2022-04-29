import React, { useState } from "react";
import NicoInfo from "./NicoInfo";

function getVideoId(videoQuery: string): string | null {
  try {
    const url = new URL(videoQuery);
    return url.pathname.split("/").slice(-1)[0];
  } catch (e) {
    if (e.name !== "TypeError") {
      throw e;
    }
  }
  return null;
}

function AddNico() {
  const [videoId, setVideoId] = useState<string>("");
  const [videoQuery, setVideoQuery] = useState<string>("");

  const handleSearchNicoVideo = (event: React.FormEvent) => {
    event.preventDefault();
    const queryVideoId = getVideoId(videoQuery) || videoQuery;
    if (queryVideoId !== null) {
      setVideoId(queryVideoId);
    }
  };

  return (
    <div>
      <h5>Search Niconico video</h5>
      <form name="nico-form" onSubmit={handleSearchNicoVideo}>
        <input
          placeholder="Niconico Video Link or VideoID"
          onChange={(e) => setVideoQuery(e.target.value)}
        />
        <button className="btn" type="submit">
          Get Video Info
        </button>
      </form>
      {videoId !== "" ? (
        <NicoInfo videoId={videoId} showQueueFields={true} />
      ) : null}
    </div>
  );
}
export default AddNico;
