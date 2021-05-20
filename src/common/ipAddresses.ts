import { networkInterfaces } from "os";

export default function ipAddresses() {
  return Object.values(networkInterfaces())
    .flat()
    .filter((iface) => !iface.internal)
    .map((iface) => iface.address);
}
