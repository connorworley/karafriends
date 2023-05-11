import React, { useRef, useState } from "react";
import { useParams } from "react-router-dom";

import Button from "../components/Button";
import SearchFormWrapper from "../components/SearchFormWrapper";
import YouTubeInfo from "../components/YouTubeInfo";

export function getVideoId(videoQuery: string): string | null {
  try {
    const url = new URL(videoQuery);
    return url.hostname === "youtu.be"
      ? url.pathname.replace("/", "")
      : url.searchParams.get("v");
  } catch (e) {
    if (e instanceof Error && e.name !== "TypeError") {
      throw e;
    }
  }
  return videoQuery;
}

type YouTubeParams = {
  videoId: string;
};

const YouTubePage = () => {
  const params = useParams<YouTubeParams>();
  const inputRef = useRef<HTMLInputElement>(null);
  const [videoId, setVideoId] = useState<string>(params.videoId || "");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputRef.current) return;
    const newVideoId = getVideoId(inputRef.current.value);
    if (newVideoId !== null) {
      setVideoId(newVideoId);
      history.replaceState({}, "", `#/search/youtube/${newVideoId}`);
    }
  };

  return (
    <SearchFormWrapper>
      <h2>Add YouTube video</h2>
      <form onSubmit={onSubmit}>
        <input
          ref={inputRef}
          placeholder="YouTube video URL or ID"
          defaultValue={videoId}
        />
        <Button type="submit">Get Video Info</Button>
      </form>
      {videoId !== "" && <YouTubeInfo videoId={videoId} />}
    </SearchFormWrapper>
  );
};

export default YouTubePage;
