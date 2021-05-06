import path from "path";

import { app, BrowserWindow, ipcMain } from "electron"; // tslint:disable-line:no-implicit-dependencies
import isDev from "electron-is-dev";
import express from "express";

import { deleteCredentials, getCredentials } from "../common/auth";
import { login } from "./damApi";
import setupGraphQL from "./graphql";
import remoconMiddleware from "./remoconMiddleware";

getCredentials()
  .then((creds: { account: string; password: string }) =>
    login(creds.account, creds.password)
      .then((json) => [creds.account, json.data.authToken])
      .catch(() =>
        deleteCredentials().then(() => {
          // credentials were invalid, delete them and restart back to login page
          app.relaunch();
          app.exit();
          throw new Error(); // unreachable
        })
      )
  )
  .catch(() => ["", ""]) // no credentials found, go straight to login page
  .then(([username, minseiAuthToken]) => {
    const expressApp = express();
    expressApp.use(remoconMiddleware());
    setupGraphQL(expressApp, username, minseiAuthToken);
    expressApp.listen(8080);
  });

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

  rendererWindow.loadURL(
    isDev
      ? "http://localhost:3000/renderer/"
      : `file://${path.join(__dirname, "..", "renderer", "index.html")}`
  );
  rendererWindow.on("closed", () => (rendererWindow = null));
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

ipcMain.on("relaunch", () => {
  app.relaunch();
  app.exit();
});
