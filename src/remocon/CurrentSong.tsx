import React from "react";
import { graphql, useLazyLoadQuery } from "react-relay";

import { withLoader } from "../common/components/Loader";
import NicoInfo from "./NicoInfo";
import Song from "./Song";
import YoutubeInfo from "./YoutubeInfo";
import {
  CurrentSongQuery,
  CurrentSongQueryResponse,
} from "./__generated__/CurrentSongQuery.graphql";

import "./CurrentSong.css";

const currentSongQuery = graphql`
  query CurrentSongQuery {
    currentSong {
      ... on DamQueueItem {
        __typename
        songId
      }
      ... on YoutubeQueueItem {
        __typename
        songId
        hasAdhocLyrics
      }
      ... on NicoQueueItem {
        __typename
        songId
      }
    }
  }
`;

function CurrentSong() {
  const queryData = useLazyLoadQuery<CurrentSongQuery>(currentSongQuery, {});

  function getCurrentSongDisplay() {
    switch (queryData?.currentSong?.__typename) {
      case "DamQueueItem":
        return <Song id={queryData.currentSong.songId} />;
      case "YoutubeQueueItem":
        return (
          <YoutubeInfo
            videoId={queryData.currentSong.songId}
            showAdhocLyricsFields={queryData.currentSong.hasAdhocLyrics}
          />
        );
      case "NicoQueueItem":
        return <NicoInfo videoId={queryData.currentSong.songId} />;

      default:
        return (
          <div className="card no-song-container">
            <h2>No songs here boss (´・ω・｀)</h2>
          </div>
        );
    }
  }

  return <>{getCurrentSongDisplay()}</>;
}

export default withLoader(CurrentSong);
