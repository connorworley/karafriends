import { useEffect, useState } from "react";
import { fetchQuery, graphql, requestSubscription } from "react-relay";

import environment from "../../common/graphqlEnvironment";
import {
  useNowPlayingQuery,
  useNowPlayingQuery$data,
} from "./__generated__/useNowPlayingQuery.graphql";

import {
  useNowPlayingSubscription,
  useNowPlayingSubscription$data,
} from "./__generated__/useNowPlayingSubscription.graphql";

const nowPlayingQuery = graphql`
  query useNowPlayingQuery {
    currentSong {
      ... on YoutubeQueueItem {
        __typename
        songId
        name
        artistName
        playtime
        timestamp
        userIdentity {
          deviceId
          nickname
        }
        hasAdhocLyrics
      }

      ... on QueueItemInterface {
        __typename
        songId
        name
        artistName
        playtime
        timestamp
        userIdentity {
          deviceId
          nickname
        }
      }
    }
  }
`;

const nowPlayingSubscription = graphql`
  subscription useNowPlayingSubscription {
    currentSongChanged {
      ... on YoutubeQueueItem {
        __typename
        songId
        name
        artistName
        playtime
        timestamp
        userIdentity {
          deviceId
          nickname
        }
        hasAdhocLyrics
      }

      ... on QueueItemInterface {
        __typename
        songId
        name
        artistName
        playtime
        timestamp
        userIdentity {
          deviceId
          nickname
        }
      }
    }
  }
`;

export default function useNowPlaying() {
  const [currentSong, setCurrentSong] = useState<
    useNowPlayingSubscription$data["currentSongChanged"] | undefined
  >(undefined);

  useEffect(() => {
    const initialQuery = fetchQuery<useNowPlayingQuery>(
      environment,
      nowPlayingQuery,
      {}
    ).subscribe({
      next: (response: useNowPlayingQuery$data) =>
        setCurrentSong(response.currentSong),
    });

    const subscription = requestSubscription<useNowPlayingSubscription>(
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

  return currentSong;
}
