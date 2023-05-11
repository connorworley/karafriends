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

  const [candidateYoutubeVideoId, setCandidateYoutubeVideoId] =
    useState<string>(params.youtubeVideoId || "");

  const [youtubeVideoId, setYoutubeVideoId] = useState<string>("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputRef.current) return;

    const newYoutubeVideoId = getYoutubeVideoId(inputRef.current.value);

    if (newYoutubeVideoId !== null) {
      setCandidateYoutubeVideoId(newYoutubeVideoId);

      history.replaceState(
        {},
        "",
        `#/joysoundSong/${song.id}/${newYoutubeVideoId}`
      );
    }
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
        <h2>
          Attach Background Video (Currently Attached:{" "}
          {youtubeVideoId ? youtubeVideoId : "None"})
        </h2>
        <SearchFormWrapper>
          <form onSubmit={onSubmit}>
            <input
              ref={inputRef}
              placeholder="Youtube video URL or ID"
              defaultValue={youtubeVideoId}
            />
            <Button type="submit">Get Video Info</Button>
            {candidateYoutubeVideoId !== "" && (
              <JoysoundYouTubeInfo
                videoId={youtubeVideoId}
                candidateVideoId={candidateYoutubeVideoId}
                setYoutubeVideoId={setYoutubeVideoId}
              />
            )}
          </form>
        </SearchFormWrapper>
      </div>
    </div>
  );
};

export default withLoader(JoysoundSongPage);
