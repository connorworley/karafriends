import { createServer } from "http";
import path from "path";

import { app, BrowserWindow, dialog, ipcMain, IpcMainEvent } from "electron"; // tslint:disable-line:no-implicit-dependencies
import isDev from "electron-is-dev";
import express from "express";

import {
  Credentials,
  deleteCredentials,
  getCredentials,
  setCredentials,
} from "../common/auth";
import { login, MinseiCredentials } from "./damApi";
import { applyGraphQLMiddleware, subscriptionServer } from "./graphql";
import setupMdns from "./mdns";
import remoconMiddleware from "./remoconMiddleware";

setupMdns();

function attemptLogin(creds: Credentials) {
  return login(creds.account, creds.password)
    .then((json) => ({
      userCode: creds.account,
      authToken: json.data.authToken,
    }))
    .catch(() =>
      deleteCredentials().then(() => Promise.reject("credentials were invalid"))
    )
    .then((minseiCreds: MinseiCredentials) => {
      const expressApp = express();
      expressApp.use(remoconMiddleware());
      applyGraphQLMiddleware(expressApp, minseiCreds);
      const server = createServer(expressApp);
      server.listen(8080, subscriptionServer(server));
    });
}

let rendererWindow: BrowserWindow | null;

function createWindow() {
  rendererWindow = new BrowserWindow({
    frame: isDev,
    fullscreen: !isDev,
    webPreferences: {
      allowRunningInsecureContent: false,
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false,
      nodeIntegrationInSubFrames: false,
      nodeIntegrationInWorker: false,
      preload: path.join(__dirname, "..", "preload", "main.js"),
      webSecurity: true,
    },
  });

  // Ignore CORS when fetching ipcasting HLS
  const session = rendererWindow.webContents.session;
  const ipcastingFilter = {
    urls: ["https://*.ipcasting.jp/*"],
  };

  session.webRequest.onBeforeSendHeaders(
    ipcastingFilter,
    (details, callback) => {
      delete details.requestHeaders.Origin;
      callback({ requestHeaders: details.requestHeaders });
    }
  );

  session.webRequest.onHeadersReceived(ipcastingFilter, (details, callback) => {
    details.responseHeaders!["Access-Control-Allow-Origin"] = ["*"];
    callback({ responseHeaders: details.responseHeaders });
  });

  getCredentials()
    .then(attemptLogin)
    .catch((e) => console.debug(`Error logging in: ${e}`))
    .then(() => {
      if (rendererWindow)
        rendererWindow.loadURL(
          isDev
            ? "http://localhost:3000/renderer/"
            : `file://${path.join(__dirname, "..", "renderer", "index.html")}`
        );
    });
  rendererWindow.on("closed", () => (rendererWindow = null));

  ipcMain.on("attemptLogin", (event: IpcMainEvent, creds: Credentials) =>
    attemptLogin(creds)
      .then(() =>
        setCredentials(creds).then(() => {
          if (rendererWindow) rendererWindow.reload();
        })
      )
      .catch((e) => dialog.showErrorBox("Error logging in", e))
  );
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (rendererWindow === null) {
    createWindow();
  }
});
