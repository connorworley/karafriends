import { contextBridge, ipcRenderer } from "electron"; // tslint:disable-line:no-implicit-dependencies

import { Credentials, hasCredentials } from "../common/auth";

const nativeAudio = require("../../native"); // tslint:disable-line:no-var-requires

let inputDeviceCount = 0;
const inputDevices: { [deviceId: number]: any } = {};

contextBridge.exposeInMainWorld("karafriends", {
  isLoggedIn: hasCredentials,
  attemptLogin: (creds: Credentials) => ipcRenderer.send("attemptLogin", creds),
  nativeAudio: {
    inputDevices: nativeAudio.inputDevices,
    outputDevices: nativeAudio.outputDevices,
    inputDevice_new(name: string) {
      console.debug(
        `preload: creating input device ${inputDeviceCount}: ${name}`
      );
      inputDevices[inputDeviceCount++] = nativeAudio.inputDevice_new(name);
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
