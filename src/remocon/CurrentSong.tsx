import React from "react";
import { graphql, useLazyLoadQuery } from "react-relay";

import { withLoader } from "../common/components/Loader";
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
        id
        name
        artistName
      }
      ... on YoutubeQueueItem {
        __typename
        id
        name
        artistName
        playtime
        timestamp
        hasAdhocLyrics
      }
    }
  }
`;

function CurrentSong() {
  const queryData = useLazyLoadQuery<CurrentSongQuery>(currentSongQuery, {});

  function getCurrentSongDisplay() {
    switch (queryData?.currentSong?.__typename) {
      case "DamQueueItem":
        return <Song id={queryData.currentSong.id} />;
      case "YoutubeQueueItem":
        return (
          <YoutubeInfo
            videoId={queryData.currentSong.id}
            showAdhocLyricsFields={queryData.currentSong.hasAdhocLyrics}
          />
        );
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
