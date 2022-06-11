import React, { useRef, useState } from "react";
import { RouteComponentProps } from "react-router-dom";

import Button from "../components/Button";
import NiconicoInfo from "../components/NiconicoInfo";
import SearchFormWrapper from "../components/SearchFormWrapper";

function getVideoId(videoQuery: string): string | null {
  try {
    const url = new URL(videoQuery);
    return url.pathname.split("/").slice(-1)[0];
  } catch (e) {
    if (e.name !== "TypeError") {
      throw e;
    }
  }
  return videoQuery;
}

interface NiconicoParams {
  videoId: string | undefined;
}

interface Props extends RouteComponentProps<NiconicoParams> {}

const NiconicoPage = (props: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [videoId, setVideoId] = useState<string>(
    props.match.params.videoId || ""
  );

  const onPreviewClick = () => {
    if (!inputRef.current) return;
    const newVideoId = getVideoId(inputRef.current.value);
    if (newVideoId !== null) {
      setVideoId(newVideoId);
      history.replaceState({}, "", `#/search/niconico/${newVideoId}`);
    }
  };

  return (
    <SearchFormWrapper>
      <h2>Add Niconico video</h2>
      <input
        ref={inputRef}
        placeholder="Niconico video URL or ID"
        defaultValue={videoId}
      />
      <Button onClick={onPreviewClick}>Preview video</Button>
      {videoId !== "" && <NiconicoInfo videoId={videoId} />}
    </SearchFormWrapper>
  );
};

export default NiconicoPage;
