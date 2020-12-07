import dgram from "dgram";

import { graphqlHTTP } from "express-graphql";
import { buildSchema } from "graphql";
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
};

function graphqlHandler() {
  return graphqlHTTP({
    schema: buildSchema(rawSchema),
    rootValue: root,
    graphiql: true,
  });
}

export default graphqlHandler;
