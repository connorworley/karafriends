import dgram from "dgram";

import { ApolloServer, makeExecutableSchema } from "apollo-server-express";

import { Application } from "express";
import isDev from "electron-is-dev";

import * as qrcode from "qrcode";

import rawSchema from "../common/schema.graphql";
import {
  findArtistsByName,
  getSongsByArtistId,
  getSongsByReqNos,
  searchMusicByKeyword,
} from "./damApi";

type NotARealDb = {
  songQueue: string[];
};

const db: NotARealDb = {
  songQueue: [],
};

const resolvers = {
  Query: {
    wanIpQrCode: () => {
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
    ): Promise<{ id: string; name: string }[]> => {
      if (args.name === null) {
        return Promise.resolve([]);
      }
      return findArtistsByName(args.name).then((json) =>
        json.searchResult.map((searchResult) => ({
          id: searchResult.artistId,
          name: searchResult.artistName,
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
  },
  Mutation: {
    queueSong: (_: any, args: { id: string }): Promise<boolean> => {
      db.songQueue.push(args.id);
      return Promise.resolve(true);
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

function setupGraphQL(app: Application) {
  const server = new ApolloServer({
    schema: makeExecutableSchema({
      typeDefs: rawSchema,
      resolvers,
    }),
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
