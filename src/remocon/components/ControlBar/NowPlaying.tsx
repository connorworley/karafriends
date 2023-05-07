import React, { useEffect, useState } from "react";
import { fetchQuery, graphql, requestSubscription } from "react-relay";

import environment from "../../../common/graphqlEnvironment";
import useNickname from "../../hooks/useNickname";
import SongQueueItem from "../SongQueue/SongQueueItem";
import styles from "./ControlBar.module.scss";
import {
  NowPlayingQuery,
  NowPlayingQuery$data,
} from "./__generated__/NowPlayingQuery.graphql";
import {
  NowPlayingSubscription,
  NowPlayingSubscription$data,
} from "./__generated__/NowPlayingSubscription.graphql";

const nowPlayingQuery = graphql`
  query NowPlayingQuery {
    currentSong {
      ... on QueueItemInterface {
        __typename
        songId
        name
        artistName
        playtime
        timestamp
        nickname
      }
    }
  }
`;

const nowPlayingSubscription = graphql`
  subscription NowPlayingSubscription {
    currentSongChanged {
      ... on QueueItemInterface {
        __typename
        songId
        name
        artistName
        playtime
        timestamp
        nickname
      }
    }
  }
`;

const NowPlaying = () => {
  const nickname = useNickname();
  const [currentSong, setCurrentSong] =
    useState<NowPlayingSubscription$data["currentSongChanged"]>(null);

  useEffect(() => {
    const initialQuery = fetchQuery<NowPlayingQuery>(
      environment,
      nowPlayingQuery,
      {}
    )
      // @ts-ignore: @types/react-relay has wrong return type for fetchQuery
      .subscribe({
        next: (response: NowPlayingQuery$data) =>
          setCurrentSong(response.currentSong),
      });
    const subscription = requestSubscription<NowPlayingSubscription>(
      environment,
      {
        subscription: nowPlayingSubscription,
        variables: {},
        onNext: (response) =>
          setCurrentSong(response?.currentSongChanged || null),
      }
    );
    return () => {
      initialQuery.unsubscribe();
      subscription.dispose();
    };
  }, []);

  return (
    <div className={styles.nowPlaying}>
      {currentSong && (
        <SongQueueItem
          item={currentSong}
          eta={0}
          myNickname={nickname}
          isCurrent={true}
        />
      )}
    </div>
  );
};

export default NowPlaying;
