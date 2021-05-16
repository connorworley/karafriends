import mdns from "multicast-dns";
import { networkInterfaces } from "os";

import { HOSTNAME } from "../common/constants";

export default function setupMdns() {
  const mdnsObj = mdns();
  mdnsObj.on("query", (query: any) => {
    if (
      query.questions[0] &&
      query.questions[0].name === HOSTNAME &&
      query.questions[0].type === "A"
    ) {
      mdnsObj.respond({
        answers: Object.values(networkInterfaces())
          .flat()
          .filter((iface) => !iface.internal)
          .map((iface) => ({
            name: HOSTNAME,
            type: "A",
            ttl: 300,
            data: iface.address,
          })),
      });
    }
  });
}
