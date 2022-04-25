import React, { useEffect, useRef, useState } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import invariant from "ts-invariant";
import YoutubePlayer from "youtube-player";
import { withLoader } from "../common/components/Loader";
import YoutubeQueueButton from "./components/YoutubeQueueButton";
import {
  YoutubeInfoVideoInfoQuery,
  YoutubeInfoVideoInfoQueryResponse,
} from "./__generated__/YoutubeInfoVideoInfoQuery.graphql";

import "materialize-css/dist/css/materialize.css"; // tslint:disable-line:no-submodule-imports
import "./YoutubeInfo.css";

const youtubeInfoVideoInfoQuery = graphql`
  query YoutubeInfoVideoInfoQuery($videoId: String!) {
    youtubeVideoInfo(videoId: $videoId) {
      ... on YoutubeVideoInfo {
        __typename
        author
        captionLanguages {
          name
          code
        }
        channelId
        keywords
        lengthSeconds
        description
        title
        viewCount
      }
      ... on YoutubeVideoInfoError {
        __typename
        reason
      }
    }
  }
`;

type YoutubeInfoProps = {
  showQueueFields?: boolean;
  showAdhocLyricsFields?: boolean;
  videoId: string;
};

function YoutubeInfo(props: YoutubeInfoProps) {
  const playerRef: React.MutableRefObject<ReturnType<
    typeof YoutubePlayer
  > | null> = useRef(null);
  const { videoId } = props;
  const [adhocSongLyrics, setAdhocSongLyrics] = useState<string | null>(null);
  const [selectedCaption, setSelectedCaption] = useState<string | undefined>(
    undefined
  );
  const videoData = useLazyLoadQuery<YoutubeInfoVideoInfoQuery>(
    youtubeInfoVideoInfoQuery,
    { videoId }
  );

  useEffect(() => {
    if (playerRef.current == null) {
      playerRef.current = YoutubePlayer("youtube-player", { videoId });
    } else {
      playerRef.current.loadVideoById(videoId);
      playerRef.current.stopVideo();
    }
  }, [props.videoId]);

  function onAdhocSongLyricsChanged(
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) {
    const input = event.target.value;
    setAdhocSongLyrics(input && input.trim() !== "" ? input : null);
  }

  function displayVideoInfo(videoInfo: YoutubeInfoVideoInfoQueryResponse) {
    switch (videoData.youtubeVideoInfo.__typename) {
      case "YoutubeVideoInfo":
        return (
          <div className="flex-container flex-vertical details-container">
            <div className="flex-item">
              <span className="channel-name">
                {videoData.youtubeVideoInfo.author}
              </span>
            </div>
            <div className="flex-item">{videoData.youtubeVideoInfo.title}</div>
            <div className="flex-item">
              View Count: {videoData.youtubeVideoInfo.viewCount} | Video Length:{" "}
              {videoData.youtubeVideoInfo.lengthSeconds}
            </div>
            {props.showQueueFields ? getQueueFields() : null}
            {props.showAdhocLyricsFields ? getAdhocLyricsFields() : null}
          </div>
        );

      case "YoutubeVideoInfoError":
        return (
          <div className="flex-item">
            Unable to get video info for the following reason:{" "}
            {videoData.youtubeVideoInfo.reason}
          </div>
        );
    }
  }

  function getQueueFields() {
    invariant(videoData.youtubeVideoInfo.__typename === "YoutubeVideoInfo");
    return (
      <>
        <div className="flex-item">
          <YoutubeQueueButton
            defaultText={"Queue Song"}
            variables={{
              input: {
                songId: videoId,
                name: videoData.youtubeVideoInfo.title,
                artistName: videoData.youtubeVideoInfo.author,
                playtime: videoData.youtubeVideoInfo.lengthSeconds,
                nickname: localStorage.getItem("nickname") || "unknown",
                adhocSongLyrics,
                captionCode: selectedCaption || null,
              },
            }}
          />
        </div>
        <h5 id="add-lyrics">Add Lyrics:</h5>
        <div className="flex-container flex-vertical flex-item add-lyrics-section">
          <h6 className="add-lyrics-section">From Captions</h6>
          <label className="flex-item radio-item">
            <input
              checked={selectedCaption === undefined}
              name="captions"
              type="radio"
              value={undefined}
              onChange={(event) => {
                setSelectedCaption(undefined);
              }}
            />
            <span>None</span>
          </label>
          {videoData.youtubeVideoInfo.captionLanguages.map(
            (captionLanguage) => {
              return (
                <label className="flex-item radio-item">
                  <input
                    checked={selectedCaption === captionLanguage.code}
                    name="captions"
                    type="radio"
                    value={captionLanguage.code}
                    onChange={(event) => {
                      setSelectedCaption(captionLanguage.code);
                    }}
                  />
                  <span>{captionLanguage.name}</span>
                </label>
              );
            }
          )}
        </div>
        <div className="flex-item lyrics-input-container">
          <h6 className="add-lyrics-section">Manual Lyrics</h6>
          <textarea
            onChange={onAdhocSongLyricsChanged}
            placeholder={
              "Paste adhoc song lyrics here (Empty lines will be filtered out). Lyrics can be added line by line onto the screen while the song is playing"
            }
          />
        </div>
      </>
    );
  }

  function getAdhocLyricsFields() {
    invariant(videoData.youtubeVideoInfo.__typename === "YoutubeVideoInfo");
    return (
      <>
        <button
          className="btn"
          onClick={() =>
            (location.href = `${window.location.protocol}//${window.location.host}/#/adhocLyrics/${videoId}`)
          }
        >
          Guide Adhoc Lyrics
        </button>
      </>
    );
  }

  return (
    <div className="flex-container card">
      <div className="responsive-player-width">
        <div id="youtube-player" className="flex-item" />
      </div>
      {displayVideoInfo(videoData)}
    </div>
  );
}

export default withLoader(YoutubeInfo);
