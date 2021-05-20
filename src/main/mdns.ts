import mdns from "multicast-dns";

import { HOSTNAME } from "../common/constants";
import ipAddresses from "../common/ipAddresses";

export default function setupMdns() {
  const mdnsObj = mdns();
  mdnsObj.on("query", (query: any) => {
    if (
      query.questions[0] &&
      query.questions[0].name === HOSTNAME &&
      query.questions[0].type === "A"
    ) {
      mdnsObj.respond({
        answers: ipAddresses().map((address) => ({
          name: HOSTNAME,
          type: "A",
          ttl: 300,
          data: address,
        })),
      });
    }
  });
}
