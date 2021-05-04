import { networkInterfaces } from "os";
// @ts-ignore: TODO: stub me
import mdns from "multicast-dns";

export const HOSTNAME = "karafriends.local";

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
