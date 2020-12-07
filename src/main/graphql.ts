import dgram from "dgram";

import { graphqlHTTP } from "express-graphql";
import { buildSchema } from "graphql";
import fetch from "node-fetch";

import rawSchema from "../common/schema.graphql";

const root = {
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
  songsByName: (args: {
    name: string;
  }): Promise<[{ name: string; requestNo: number }]> => {
    return fetch("https://denmoku.clubdam.com/dkdenmoku/DkDamSearchServlet", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        deviceId: "abcdef123456789",
        categoryCd: "020000",
        songName: args.name,
        songMatchType: "0",
        page: "1",
      }),
    })
      .then((res) => {
        return res.json();
      })
      .then((json) => {
        return json.searchResult.map((songResult: any) => {
          return {
            id: songResult.reqNo,
            name: songResult.songName,
          };
        });
      });
  },
};

function graphqlHandler() {
  return graphqlHTTP({
    schema: buildSchema(rawSchema),
    rootValue: root,
    graphiql: true,
  });
}

export default graphqlHandler;
