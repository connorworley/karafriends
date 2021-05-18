import { Server } from "http";

import { ApolloServer, makeExecutableSchema } from "apollo-server-express";
import isDev from "electron-is-dev";
import { Application } from "express";
import { execute, subscribe } from "graphql";
import { PubSub } from "graphql-subscriptions";
import promiseRetry from "promise-retry";
import { SubscriptionServer } from "subscriptions-transport-ws";
import { isRomaji, toKana } from "wanakana";

import { HOSTNAME } from "../common/constants";
import rawSchema from "../common/schema.graphql";
import {
  getMusicListByArtist,
  getMusicStreamingUrls,
  getScoringData,
  getSongsByReqNos,
  MinseiCredentials,
  searchArtistByKeyword,
  searchMusicByKeyword,
} from "./damApi";

interface Context {
  creds: MinseiCredentials;
}

type SongInput = {
  readonly id: string;
  readonly name: string;
  readonly nameYomi: string;
  readonly artistName: string;
  readonly artistNameYomi: string;
  readonly lyricsPreview: string | null;
};

type Song = SongInput;

type QueueItem = {
  readonly song: Song;
  readonly timestamp: string;
};

type NotARealDb = {
  songQueue: QueueItem[];
};

enum SubscriptionEvent {
  QueueChanged = "QueueChanged",
  QueueAdded = "QueueAdded",
}

const db: NotARealDb = {
  songQueue: [],
};

const pubsub = new PubSub();

function stripWhitespace(str: string) {
  return str.replace(/\s+/g, "");
}

const resolvers = {
  Query: {
    songsByName: (
      _: any,
      args: {
        name: string | null;
      }
    ): Promise<
      {
        id: string;
        name: string;
        nameYomi: string;
        artistName: string;
        artistNameYomi: string;
      }[]
    > => {
      if (args.name === null) {
        return Promise.resolve([]);
      }
      const searches = [searchMusicByKeyword(args.name)];
      if (isRomaji(args.name)) {
        searches.push(searchMusicByKeyword(toKana(stripWhitespace(args.name))));
      }
      return Promise.all(searches).then((results) => {
        const { list } = results
          .map((r) => r.list)
          .flat()
          .reduce(
            (acc, cur) => {
              if (!acc.set.has(cur.requestNo)) {
                acc.list.push({
                  id: cur.requestNo,
                  name: cur.title,
                  nameYomi: cur.titleYomi,
                  artistName: cur.artist,
                  artistNameYomi: cur.artistYomi,
                });
                acc.set.add(cur.requestNo);
              }
              return acc;
            },
            {
              list: new Array<{
                id: string;
                name: string;
                nameYomi: string;
                artistName: string;
                artistNameYomi: string;
              }>(),
              set: new Set<string>(),
            }
          );
        return list;
      });
    },
    songsByIds: (
      _: any,
      args: { ids: string[] }
    ): Promise<
      {
        id: string;
        name: string;
        nameYomi: string;
        artistName: string;
        artistNameYomi: string;
        lyricsPreview: string;
      }[]
    > => {
      if (args.ids.length === 0) {
        return Promise.resolve([]);
      }
      return getSongsByReqNos(args.ids).then((json) =>
        json.isExist.map((song) => ({
          id: song.reqNo,
          name: song.songName,
          nameYomi: "",
          artistName: song.artistName,
          artistNameYomi: "",
          lyricsPreview: song.firstBars,
        }))
      );
    },
    queue: () => {
      if (!db.songQueue.length) return [];
      return db.songQueue;
    },
    artistsByName: (
      _: any,
      args: { name: string }
    ): Promise<
      { id: string; name: string; nameYomi: string; songCount: number }[]
    > => {
      if (args.name === null) {
        return Promise.resolve([]);
      }
      const searches = [searchArtistByKeyword(args.name)];
      if (isRomaji(args.name)) {
        searches.push(
          searchArtistByKeyword(toKana(stripWhitespace(args.name)))
        );
      }
      return Promise.all(searches).then((results) => {
        const { list } = results
          .map((r) => r.list)
          .flat()
          .reduce(
            (acc, cur) => {
              if (!acc.set.has(cur.artistCode)) {
                acc.list.push({
                  id: cur.artistCode.toString(),
                  name: cur.artist,
                  nameYomi: cur.artistYomi,
                  songCount: cur.holdMusicCount,
                });
                acc.set.add(cur.artistCode);
              }
              return acc;
            },
            {
              list: new Array<{
                id: string;
                name: string;
                nameYomi: string;
                songCount: number;
              }>(),
              set: new Set<number>(),
            }
          );
        return list;
      });
    },
    artistById: (
      _: any,
      args: { id: string }
    ): Promise<{
      id: string;
      name: string;
      songCount: number;
      songs: {
        id: string;
        name: string;
        nameYomi: string;
        artistName: string;
        artistNameYomi: string;
      }[];
    }> => {
      return getMusicListByArtist(args.id).then((json) => ({
        id: json.data.artistCode.toString(),
        name: json.data.artist,
        songCount: json.data.totalCount,
        songs: json.list.map((artistSong) => ({
          id: artistSong.requestNo,
          name: artistSong.title,
          nameYomi: artistSong.titleYomi,
          artistName: artistSong.artist,
          artistNameYomi: artistSong.artistYomi,
        })),
      }));
    },
    streamingUrl: (
      _: any,
      args: { id: string },
      context: Context
    ): Promise<string> => {
      // Minsei requests seem to be a bit flaky, so let's retry them if needed
      return promiseRetry((retry) =>
        getMusicStreamingUrls(
          args.id.match(/.{1,4}/g)!.join("-"),
          context.creds
        ).catch(retry)
      ).then((json) => json.list[0].highBitrateUrl);
    },
    scoringData: (
      _: any,
      args: { id: string },
      context: Context
    ): Promise<number[]> => {
      return promiseRetry((retry) =>
        getScoringData(
          args.id.match(/.{1,4}/g)!.join("-"),
          context.creds
        ).catch(retry)
      ).then((scoringData) => Array.from(new Uint8Array(scoringData)));
    },
  },
  Mutation: {
    queueSong: (_: any, args: { song: SongInput }): boolean => {
      const queueItem = {
        song: args.song,
        timestamp: Date.now().toString(),
      };
      db.songQueue.push(queueItem);
      pubsub.publish(SubscriptionEvent.QueueChanged, {
        queueChanged: db.songQueue,
      });
      pubsub.publish(SubscriptionEvent.QueueAdded, {
        queueAdded: queueItem,
      });
      return true;
    },
    popSong: (_: any, args: {}): QueueItem | null => {
      pubsub.publish(SubscriptionEvent.QueueChanged, {
        queueChanged: db.songQueue,
      });
      return db.songQueue.shift() || null;
    },
    removeSong: (
      _: any,
      args: { songId: string; timestamp: string }
    ): boolean => {
      db.songQueue = db.songQueue.filter(
        (item) =>
          !(item.song.id === args.songId && item.timestamp === args.timestamp)
      );
      pubsub.publish(SubscriptionEvent.QueueChanged, {
        queueChanged: db.songQueue,
      });
      return true;
    },
  },
  Subscription: {
    queueChanged: {
      subscribe: () => pubsub.asyncIterator([SubscriptionEvent.QueueChanged]),
    },
    queueAdded: {
      subscribe: () => pubsub.asyncIterator([SubscriptionEvent.QueueAdded]),
    },
  },
};

const schema = makeExecutableSchema({
  typeDefs: rawSchema,
  resolvers,
});

export function applyGraphQLMiddleware(
  app: Application,
  creds: MinseiCredentials
) {
  const server = new ApolloServer({
    context: {
      creds,
    },
    schema,
  });
  if (isDev) {
    app.use("/graphql", (req, res, next) => {
      res.append("Access-Control-Allow-Origin", "*");
      res.append("Access-Control-Allow-Headers", "*");
      if (req.method === "OPTIONS") {
        res.sendStatus(200);
        return;
      }
      next();
    });
  }
  server.applyMiddleware({ app });
}

export function subscriptionServer(server: Server) {
  return () => {
    return new SubscriptionServer(
      {
        execute,
        subscribe,
        schema,
      },
      {
        server,
        path: "/subscriptions",
      }
    );
  };
}
