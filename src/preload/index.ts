import { contextBridge, ipcRenderer } from "electron"; // tslint:disable-line:no-implicit-dependencies

import { Credentials, hasCredentials } from "../common/auth";

contextBridge.exposeInMainWorld("karafriends", {
  isLoggedIn: hasCredentials,
  attemptLogin: (creds: Credentials) => ipcRenderer.send("attemptLogin", creds),
});
