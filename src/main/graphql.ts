import dgram from "dgram";

import { ApolloServer, makeExecutableSchema } from "apollo-server-express";
import isDev from "electron-is-dev";
import { Application } from "express";
import promiseRetry from "promise-retry";
import * as qrcode from "qrcode";

import rawSchema from "../common/schema.graphql";
import {
  getMusicStreamingUrls,
  getScoringData,
  getSongsByArtistId,
  getSongsByReqNos,
  MinseiCredentials,
  searchArtistByKeyword,
  searchMusicByKeyword,
} from "./damApi";

interface Context {
  creds: MinseiCredentials;
}

type NotARealDb = {
  songQueue: string[];
};

const db: NotARealDb = {
  songQueue: [],
};

const resolvers = {
  Query: {
    wanIpQrCode: (): Promise<string> => {
      // Trick to get the IP address of the iface we would use to access the internet
      // This address should be usable except in rare cases where LAN and WAN go through different ifaces
      const sock = dgram.createSocket({ type: "udp4" });
      return new Promise((resolve) => {
        sock.connect(1, "1.1.1.1", () => {
          qrcode.toDataURL(
            `${sock.address().address}:8080`,
            {
              errorCorrectionLevel: "L",
            },
            (error, url) => resolve(url)
          );
        });
      });
    },
    songsByName: (
      _: any,
      args: {
        name: string | null;
      }
    ): Promise<{ id: string; name: string; artistName: string }[]> => {
      if (args.name === null) {
        return Promise.resolve([]);
      }
      return searchMusicByKeyword(args.name).then((json) => {
        return json.list.map((songResult) => {
          return {
            id: songResult.requestNo,
            name: songResult.title,
            artistName: songResult.artist,
          };
        });
      });
    },
    songsByIds: (
      _: any,
      args: { ids: string[] }
    ): Promise<
      { id: string; name: string; artistName: string; lyricsPreview: string }[]
    > => {
      if (args.ids.length === 0) {
        return Promise.resolve([]);
      }
      return getSongsByReqNos(args.ids).then((json) =>
        json.isExist.map((song) => ({
          id: song.reqNo,
          name: song.songName,
          artistName: song.artistName,
          lyricsPreview: song.firstBars,
        }))
      );
    },
    songsInQueue: () => {
      if (!db.songQueue.length) return [];
      return getSongsByReqNos(db.songQueue).then((json) =>
        json.isExist.map((song) => ({
          id: song.reqNo,
          name: song.songName,
          artistName: song.artistName,
          lyricsPreview: song.firstBars,
        }))
      );
    },
    artistsByName: (
      _: any,
      args: { name: string }
    ): Promise<{ id: string; name: string; songCount: number }[]> => {
      if (args.name === null) {
        return Promise.resolve([]);
      }
      return searchArtistByKeyword(args.name).then((json) =>
        json.list.map((artistResult) => ({
          id: artistResult.artistCode.toString(),
          name: artistResult.artist,
          songCount: artistResult.holdMusicCount,
        }))
      );
    },
    artistById: (
      _: any,
      args: { id: string }
    ): Promise<{ id: string; name: string }> => {
      return getSongsByArtistId(args.id).then((json) => ({
        id: json.searchResult[0].artistId,
        name: json.searchResult[0].artistName,
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
    queueSong: (_: any, args: { id: string }): boolean => {
      db.songQueue.push(args.id);
      return true;
    },
    popSong: (_: any, args: {}): string | null => {
      return db.songQueue.shift() || null;
    },
  },
  Artist: {
    songs: (parent: {
      id: string;
      name: string;
    }): Promise<
      { id: string; name: string; artistName: string; lyricsPreview: string }[]
    > => {
      return getSongsByArtistId(parent.id).then((json) =>
        json.searchResult.map((searchResult) => ({
          id: searchResult.reqNo,
          name: searchResult.songName,
          artistName: searchResult.artistName,
          lyricsPreview: searchResult.firstBars,
        }))
      );
    },
  },
};

function setupGraphQL(app: Application, creds: MinseiCredentials) {
  const server = new ApolloServer({
    schema: makeExecutableSchema({
      typeDefs: rawSchema,
      resolvers,
    }),
    context: {
      creds,
    },
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

export default setupGraphQL;
