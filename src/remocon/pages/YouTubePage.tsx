import { invariant } from "ts-invariant";

import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import useNowPlaying from "../hooks/useNowPlaying";
import useUserIdentity from "../hooks/useUserIdentity";

import Button from "../components/Button";
import { withLoader } from "../components/Loader";
import SearchFormWrapper from "../components/SearchFormWrapper";
import YouTubeInfo from "../components/YouTubeInfo";

import { useNowPlayingQuery$data } from "../hooks/__generated__/useNowPlayingQuery.graphql";

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

export function isYouTubeVideoWithLyricsPlaying(
  currentSong: useNowPlayingQuery$data["currentSong"] | null | undefined,
  videoId: string,
  nickname: string,
  deviceId: string
): boolean {
  if (!currentSong || currentSong.__typename !== "YoutubeQueueItem") {
    return false;
  }

  invariant(currentSong.hasAdhocLyrics);

  return (
    currentSong.songId === videoId &&
    currentSong.userIdentity?.nickname === nickname &&
    currentSong.userIdentity?.deviceId === deviceId &&
    currentSong.hasAdhocLyrics
  );
}

type YouTubeParams = {
  videoId: string;
};

const YouTubePage = () => {
  const navigate = useNavigate();
  const { nickname, deviceId } = useUserIdentity();
  const currentSong = useNowPlaying();

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

  if (
    isYouTubeVideoWithLyricsPlaying(
      currentSong,
      videoId || params.videoId || "",
      nickname,
      deviceId
    )
  ) {
    navigate(`/adhocLyrics/${videoId || params.videoId || ""}`);
  }

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

export default withLoader(YouTubePage);
