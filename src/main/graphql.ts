import dgram from "dgram";

import { ApolloServer, makeExecutableSchema } from "apollo-server-express";

import { Application } from "express";
import isDev from "electron-is-dev";

import rawSchema from "../common/schema.graphql";
import { searchMusicByKeyword } from "./damApi";

const resolvers = {
  Query: {
    wanIpAddress: () => {
      // Trick to get the IP address of the iface we would use to access the internet
      // This address should be usable except in rare cases where LAN and WAN go through different ifaces
      const sock = dgram.createSocket({ type: "udp4" });
      return new Promise((resolve) => {
        sock.connect(1, "1.1.1.1", () => {
          resolve(sock.address().address);
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
