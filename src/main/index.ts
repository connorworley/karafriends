import path from "path";

import { app, BrowserWindow } from "electron"; // tslint:disable-line:no-implicit-dependencies
import isDev from "electron-is-dev";
import express from "express";

import setupGraphQL from "./graphql";
import remoconMiddleware from "./remoconMiddleware";

const expressApp = express();
expressApp.use(remoconMiddleware());
setupGraphQL(expressApp);
expressApp.listen(8080);

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
