import { contextBridge, ipcRenderer } from "electron"; // tslint:disable-line:no-implicit-dependencies

import { hasCredentials, setCredentials } from "../common/auth";

contextBridge.exposeInMainWorld("karafriends", {
  hasCredentials,
  setCredentials: (username: string, password: string) => {
    setCredentials(username, password).then(() => ipcRenderer.send("relaunch"));
  },
});
