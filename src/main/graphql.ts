import { Server } from "http";

import { ApolloServer, makeExecutableSchema } from "apollo-server-express";
import isDev from "electron-is-dev";
import { Application } from "express";
import { execute, subscribe } from "graphql";
import { PubSub } from "graphql-subscriptions";
import { SubscriptionServer } from "subscriptions-transport-ws";
import { isRomaji, toKana } from "wanakana";

import { HOSTNAME } from "../common/constants";
import rawSchema from "../common/schema.graphql";
import { DkwebsysAPI, MinseiAPI, MinseiCredentials } from "./damApi";

interface IDataSources {
  dataSources: {
    minsei: MinseiAPI;
    dkwebsys: DkwebsysAPI;
  };
}

type SongInput = {
  readonly id: string;
  readonly name: string;
  readonly artistName: string;
  readonly playtime?: number | null;
};

interface SongParent {
  readonly id: string;
  readonly name: string;
  readonly nameYomi: string;
  readonly artistName: string;
  readonly artistNameYomi: string;
  readonly lyricsPreview?: string | null;
  readonly vocalTypes?: string[];
  readonly tieUp?: string | null;
  readonly playtime?: number | null;
}

interface ArtistParent {
  readonly id: string;
  readonly name: string;
  readonly nameYomi: string;
  readonly songCount: number;
}

interface Artist extends ArtistParent {
  readonly songs: Connection<SongParent, string>;
}

interface Connection<NodeType, CursorType> {
  readonly edges: Edge<NodeType, CursorType>[];
  readonly pageInfo: PageInfo<CursorType>;
}

interface Edge<NodeType, CursorType> {
  readonly node: NodeType;
  readonly cursor: CursorType;
}

interface PageInfo<CursorType> {
  readonly hasPreviousPage: boolean;
  readonly hasNextPage: boolean;
  readonly startCursor: CursorType;
  readonly endCursor: CursorType;
}

type QueueItem = {
  readonly song: SongInput;
  readonly timestamp: string;
  readonly streamingUrl: string;
};

interface HistoryItem {
  readonly song: SongParent;
  readonly playDate: string;
}

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

const resolvers = {
  Song: {
    id(parent: SongParent) {
      return parent.id;
    },
    name(parent: SongParent) {
      return parent.name;
    },
    nameYomi(parent: SongParent) {
      return parent.nameYomi;
    },
    artistName(parent: SongParent) {
      return parent.artistName;
    },
    artistNameYomi(parent: SongParent) {
      return parent.artistNameYomi;
    },
    lyricsPreview(parent: SongParent) {
      return parent.lyricsPreview || null;
    },
    vocalTypes(parent: SongParent) {
      return parent.vocalTypes || [];
    },
    tieUp(parent: SongParent) {
      return parent.tieUp || null;
    },
    playtime(parent: SongParent) {
      return parent.playtime || null;
    },
    streamingUrls(parent: SongParent, _: any, { dataSources }: IDataSources) {
      return dataSources.minsei.getMusicStreamingUrls(parent.id).then((data) =>
        data.list.map((info) => ({
          url: info.highBitrateUrl,
        }))
      );
    },
    scoringData(parent: SongParent, _: any, { dataSources }: IDataSources) {
      return dataSources.minsei
        .getScoringData(parent.id)
        .then((data) => Array.from(new Uint8Array(data)));
    },
  },
  Artist: {
    id(parent: ArtistParent) {
      return parent.id;
    },
    name(parent: ArtistParent) {
      return parent.name;
    },
    nameYomi(parent: ArtistParent) {
      return parent.nameYomi;
    },
    songCount(parent: ArtistParent) {
      return parent.songCount;
    },
    songs(
      parent: ArtistParent,
      args: { first: number | null; after: string | null },
      { dataSources }: IDataSources
    ) {
      const firstInt = args.first || 0;
      const afterInt = args.after ? parseInt(args.after, 10) : 0;

      return dataSources.dkwebsys
        .getMusicListByArtist(parent.id, firstInt, afterInt)
        .then((result) => ({
          edges: result.list.map((song, i) => ({
            node: {
              id: song.requestNo,
              name: song.title,
              nameYomi: song.titleYomi,
              artistName: song.artist,
              artistNameYomi: song.artistYomi,
            },
            cursor: (firstInt + 1).toString(),
          })),
          pageInfo: {
            hasPreviousPage: false,
            hasNextPage: firstInt + afterInt < result.data.totalCount,
            startCursor: "0",
            endCursor: (firstInt + afterInt).toString(),
          },
        }));
    },
  },
  Query: {
    songsByName: (
      _: any,
      args: { name: string; first: number | null; after: string | null },
      { dataSources }: IDataSources
    ): Promise<Connection<SongParent, string>> => {
      const firstInt = args.first || 0;
      const afterInt = args.after ? parseInt(args.after, 10) : 0;

      return dataSources.dkwebsys
        .getMusicByKeyword(args.name, firstInt, afterInt)
        .then((result) => ({
          edges: result.list.map((song, i) => ({
            node: {
              id: song.requestNo,
              name: song.title,
              nameYomi: song.titleYomi,
              artistName: song.artist,
              artistNameYomi: song.artistYomi,
            },
            cursor: (firstInt + i).toString(),
          })),
          pageInfo: {
            hasPreviousPage: false, // We can always do this because we don't support backward pagination
            hasNextPage: firstInt + afterInt < result.data.totalCount,
            startCursor: "0",
            endCursor: (firstInt + afterInt).toString(),
          },
        }));
    },
    songById: (
      _: any,
      args: { id: string },
      { dataSources }: IDataSources
    ): Promise<SongParent> =>
      dataSources.dkwebsys.getMusicDetailsInfo(args.id).then((data) => ({
        id: args.id,
        name: data.data.title,
        nameYomi: data.data.titleYomi_Kana,
        artistName: data.data.artist,
        artistNameYomi: "",
        lyricsPreview: data.data.firstLine,
        vocalTypes: data.list[0].mModelMusicInfoList[0].guideVocal
          .split(",")
          .map((vocalType) => {
            switch (vocalType) {
              case "0":
                return "NORMAL";
              case "1":
                return "GUIDE_MALE";
              case "2":
                return "GUIDE_FEMALE";
              default:
                throw new Error(`unknown vocal type ${vocalType}`);
            }
          }),
        tieUp: data.list[0].mModelMusicInfoList[0].highlightTieUp,
        playtime: parseInt(data.list[0].mModelMusicInfoList[0].playtime, 10),
      })),
    artistsByName: (
      _: any,
      args: { name: string; first: number | null; after: string | null },
      { dataSources }: IDataSources
    ): Promise<Connection<ArtistParent, string>> => {
      const firstInt = args.first || 0;
      const afterInt = args.after ? parseInt(args.after, 10) : 0;

      return dataSources.dkwebsys
        .getArtistByKeyword(args.name, firstInt, afterInt)
        .then((result) => ({
          edges: result.list.map((artist, i) => ({
            node: {
              id: artist.artistCode.toString(),
              name: artist.artist,
              nameYomi: artist.artistYomi,
              songCount: artist.holdMusicCount,
            },
            cursor: (firstInt + i).toString(),
          })),
          pageInfo: {
            hasPreviousPage: false, // We can always do this because we don't support backward pagination
            hasNextPage: firstInt + afterInt < result.data.totalCount,
            startCursor: "0",
            endCursor: (firstInt + afterInt).toString(),
          },
        }));
    },
    artistById: (
      _: any,
      args: { id: string; first: number | null; after: string | null },
      { dataSources }: IDataSources
    ): Promise<ArtistParent> => {
      const firstInt = args.first || 0;
      const afterInt = args.after ? parseInt(args.after, 10) : 0;

      return dataSources.dkwebsys
        .getMusicListByArtist(args.id, firstInt, afterInt)
        .then((data) => ({
          id: args.id,
          name: data.data.artist,
          nameYomi: data.data.artistYomi_Kana,
          songCount: data.data.totalCount,
        }));
    },
    queue: () => {
      if (!db.songQueue.length) return [];
      return db.songQueue;
    },
    history: (
      _: any,
      args: { first: number | null; after: string | null },
      { dataSources }: IDataSources
    ): Promise<Connection<HistoryItem, string>> => {
      const firstInt = args.first || 0;
      const afterInt = args.after ? parseInt(args.after, 10) : 0;

      return dataSources.minsei
        .getPlayHistory(firstInt, afterInt)
        .then((result) => ({
          edges: result.list.map((song, i) => ({
            node: {
              song: {
                id: song.requestNo,
                name: song.contentsName,
                nameYomi: song.contentsYomi,
                artistName: song.artistName,
                artistNameYomi: "",
              },
              playDate: song.playDate,
            },
            cursor: (firstInt + i).toString(),
          })),
          pageInfo: {
            hasPreviousPage: false, // We can always do this because we don't support backward pagination
            hasNextPage:
              firstInt + afterInt < parseInt(result.data.dataCount, 10),
            startCursor: "0",
            endCursor: (firstInt + afterInt).toString(),
          },
        }));
    },
  },
  Mutation: {
    queueSong: (
      _: any,
      args: { song: SongInput; streamingUrl: string }
    ): number => {
      const queueItem = {
        timestamp: Date.now().toString(),
        ...args,
      };
      db.songQueue.push(queueItem);
      pubsub.publish(SubscriptionEvent.QueueChanged, {
        queueChanged: db.songQueue,
      });
      pubsub.publish(SubscriptionEvent.QueueAdded, {
        queueAdded: queueItem,
      });
      return db.songQueue.reduce(
        (acc, cur) => acc + (cur.song.playtime || 0),
        0
      );
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
    dataSources: () => ({
      minsei: new MinseiAPI(creds),
      dkwebsys: new DkwebsysAPI(),
    }),
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
