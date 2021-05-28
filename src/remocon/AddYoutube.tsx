import React, { useState } from "react";
import YoutubeInfo from "./YoutubeInfo";

function getVideoId(videoQuery: string): string | null {
  try {
    const url = new URL(videoQuery);
    if (url.hostname === "youtu.be") {
      return url.pathname.replace("/", "");
    }
    return url.searchParams.get("v");
  } catch (e) {
    if (e.name !== "TypeError") {
      throw e;
    }
  }
  return null;
}

function AddYoutube() {
  const [videoId, setVideoId] = useState<string>("");
  const [videoQuery, setVideoQuery] = useState<string>("");

  const handleSearchYoutubeVideo = (event: React.FormEvent) => {
    event.preventDefault();
    const queryVideoId = getVideoId(videoQuery) || videoQuery;
    if (queryVideoId !== null) {
      setVideoId(queryVideoId);
    }
  };

  return (
    <div>
      <h5>Search Youtube video</h5>
      <form name="youtube-form" onSubmit={handleSearchYoutubeVideo}>
        <input
          placeholder="Youtube Video Link or VideoID"
          onChange={(e) => setVideoQuery(e.target.value)}
        />
        <button className="btn" type="submit">
          Preview Video
        </button>
      </form>
      {videoId !== "" ? (
        <YoutubeInfo videoId={videoId} showQueueFields={true} />
      ) : null}
    </div>
  );
}
export default AddYoutube;
