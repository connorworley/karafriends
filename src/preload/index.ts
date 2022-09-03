import { contextBridge, ipcRenderer } from "electron"; // tslint:disable-line:no-implicit-dependencies

import { Credentials, hasCredentials } from "../common/auth";
import { KarafriendsConfig } from "../common/config";
import ipAddresses from "../common/ipAddresses";

import nativeAudio = require("../../native"); // tslint:disable-line:no-var-requires

let inputDeviceCount = 0;
const inputDevices: { [deviceId: number]: any } = {};

let karafriendsConfig: KarafriendsConfig | null = null;

contextBridge.exposeInMainWorld("karafriends", {
  isLoggedIn: hasCredentials,
  attemptLogin: (creds: Credentials) => ipcRenderer.send("attemptLogin", creds),
  ipAddresses,
  karafriendsConfig: () => {
    if (karafriendsConfig === null) {
      console.log("Making sync request for configs");
      karafriendsConfig = ipcRenderer.sendSync("config");
    }

    return karafriendsConfig;
  },
  nativeAudio: {
    inputDevices: nativeAudio.inputDevices,
    outputDevices: nativeAudio.outputDevices,
    inputDevice_new(name: string, channelSelection: number) {
      console.debug(
        `preload: creating input device ${inputDeviceCount}: ${name}`
      );
      inputDevices[inputDeviceCount++] = nativeAudio.inputDevice_new(
        name,
        channelSelection
      );
      return inputDeviceCount - 1;
    },
    inputDevice_delete(deviceId: number) {
      console.debug(`preload: deleting input device ${deviceId}`);
      delete inputDevices[deviceId];
    },
    inputDevice_getPitch(deviceId: number) {
      return nativeAudio.inputDevice_getPitch(inputDevices[deviceId]);
    },
    inputDevice_stop(deviceId: number) {
      return nativeAudio.inputDevice_stop(inputDevices[deviceId]);
    },
  },
});
