import React, { useEffect, useRef, useState } from "react";
import { graphql, QueryRenderer, useLazyLoadQuery } from "react-relay";
import { Link } from "react-router-dom";
import YoutubePlayer from "youtube-player";
import PreviewYoutube from "./PreviewYoutube";

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
        <button type="submit">Preview Video</button>
      </form>
      {videoId !== "" ? <PreviewYoutube videoId={videoId} /> : null}
    </div>
  );
}
export default AddYoutube;
