import React, { useRef, useState } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { Link, useParams } from "react-router-dom";

import Button from "../components/Button";
import JoysoundQueueButtons from "../components/JoysoundQueueButtons";
import { withLoader } from "../components/Loader";
import SearchFormWrapper from "../components/SearchFormWrapper";
import YouTubeInfo from "../components/YouTubeInfo";
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

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputRef.current) return;

    const newYoutubeVideoId = getYoutubeVideoId(inputRef.current.value);

    if (newYoutubeVideoId !== null) {
      setYoutubeVideoId(newYoutubeVideoId);

      history.replaceState(
        {},
        "",
        `#/joysoundSong/${song.id}/${newYoutubeVideoId}`
      );
    }
  };

  const detatchButtonOnClick = () => {
    if (!inputRef.current) return;

    setYoutubeVideoId("");
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
      <JoysoundQueueButtons song={song} youtubeVideoId={youtubeVideoId} />
      <div>
        <h2>Attach Custom Background Video</h2>
        <SearchFormWrapper>
          <form onSubmit={onSubmit}>
            <input
              ref={inputRef}
              placeholder="Youtube video URL or ID"
              defaultValue={youtubeVideoId}
            />
            {youtubeVideoId !== "" && (
              <YouTubeInfo videoId={youtubeVideoId} isSimple={true} />
            )}
            <Button type="submit">
              Attach YouTube Video (Currently Attached ID:{" "}
              {youtubeVideoId === "" ? "None" : youtubeVideoId})
            </Button>
          </form>
          {youtubeVideoId !== "" && (
            <Button onClick={detatchButtonOnClick}>
              Detatch YouTube Video
            </Button>
          )}
        </SearchFormWrapper>
      </div>
    </div>
  );
};

export default withLoader(JoysoundSongPage);
