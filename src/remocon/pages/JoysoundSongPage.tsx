import React, { useRef, useState } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { Link, useParams } from "react-router-dom";

import Button from "../components/Button";
import JoysoundQueueButtons from "../components/JoysoundQueueButtons";
import JoysoundYouTubeInfo from "../components/JoysoundYouTubeInfo";
import { withLoader } from "../components/Loader";
import SearchFormWrapper from "../components/SearchFormWrapper";
import { JoysoundSongPageQuery } from "./__generated__/JoysoundSongPageQuery.graphql";

import { getVideoId as getYoutubeVideoId } from "./YouTubePage";

const joysoundSongPageQuery = graphql`
  query JoysoundSongPageQuery($id: String!) {
    joysoundSongDetail(id: $id) {
      id
      name
      artistName
      lyricsPreview
      tieUp
    }
  }
`;

type RouteParams = {
  id: string;
  youtubeVideoId?: string;
};

const JoysoundSongPage = () => {
  const params = useParams<RouteParams>();
  const inputRef = useRef<HTMLInputElement>(null);

  const data = useLazyLoadQuery<JoysoundSongPageQuery>(joysoundSongPageQuery, {
    id: params.id!,
  });

  const song = data.joysoundSongDetail;

  const [youtubeVideoId, setYoutubeVideoId] = useState<string>(
    params.youtubeVideoId || ""
  );
  const [validatedYoutubeId, setValidatedYoutubeVideoId] = useState<string>("");
  const [waitForVideoIdInput, setWaitForVideoIdInput] =
    useState<boolean>(false);

  const onSubmitYoutubeForm = (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputRef.current) return;

    const newYoutubeVideoId = getYoutubeVideoId(inputRef.current.value);

    if (newYoutubeVideoId !== null) {
      setYoutubeVideoId(newYoutubeVideoId);
      setWaitForVideoIdInput(false);

      history.replaceState(
        {},
        "",
        `#/joysoundSong/${song.id}/${newYoutubeVideoId}`
      );
    }
  };

  const detachVideo = () => {
    setYoutubeVideoId("");
    setValidatedYoutubeVideoId("");

    history.replaceState({}, "", `#/joysoundSong/${song.id}`);
  };

  return (
    <div>
      <h2>{song.name}</h2>
      <Link to={`/search/artist/${song.artistName}`}>{song.artistName}</Link>
      {!!song.tieUp && <span> • {song.tieUp}</span>}
      {!!song.lyricsPreview && (
        <blockquote>{song.lyricsPreview} ...</blockquote>
      )}
      {youtubeVideoId ? (
        <Button full onClick={() => detachVideo()}>
          Detach YouTube video
        </Button>
      ) : (
        <Button
          full
          onClick={() => setWaitForVideoIdInput(!waitForVideoIdInput)}
        >
          {waitForVideoIdInput ? "Cancel" : "Set background video from YouTube"}
        </Button>
      )}
      {waitForVideoIdInput ? (
        <SearchFormWrapper>
          <form onSubmit={onSubmitYoutubeForm}>
            <input
              ref={inputRef}
              placeholder="Youtube video URL or ID"
              defaultValue={youtubeVideoId}
            />
            <Button full type="submit">
              Set video
            </Button>
          </form>
        </SearchFormWrapper>
      ) : (
        <>
          <JoysoundQueueButtons
            song={song}
            youtubeVideoId={youtubeVideoId}
            validatedYoutubeId={validatedYoutubeId}
          />
          {youtubeVideoId !== "" && (
            <JoysoundYouTubeInfo
              videoId={youtubeVideoId}
              setYoutubeVideoId={setValidatedYoutubeVideoId}
            />
          )}
        </>
      )}
    </div>
  );
};

export default withLoader(JoysoundSongPage);
