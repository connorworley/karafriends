declare module "multicast-dns" {
  export default function mdns(): {
    on(
      packetType: "query",
      callback: (query: {
        questions: {
          name: string;
          type: string;
        }[];
      }) => void
    ): void;
    respond(packet: {
      answers: {
        name: string;
        type: string;
        ttl: number;
        data: string;
      }[];
    }): void;
  };
}
