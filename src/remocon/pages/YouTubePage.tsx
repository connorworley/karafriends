import React, { useRef, useState } from "react";
import { RouteComponentProps } from "react-router-dom";

import Button from "../components/Button";
import SearchFormWrapper from "../components/SearchFormWrapper";
import YouTubeInfo from "../components/YouTubeInfo";

function getVideoId(videoQuery: string): string | null {
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

interface YouTubeParams {
  videoId: string | undefined;
}

interface Props extends RouteComponentProps<YouTubeParams> {}

const YouTubePage = (props: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [videoId, setVideoId] = useState<string>(
    props.match.params.videoId || ""
  );

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
        <Button type="submit">Preview video</Button>
      </form>
      {videoId !== "" && <YouTubeInfo videoId={videoId} />}
    </SearchFormWrapper>
  );
};

export default YouTubePage;
