import path from "path";

import { app, BrowserWindow } from "electron"; // tslint:disable-line:no-implicit-dependencies
import isDev from "electron-is-dev";
import express from "express";

import remoconMiddleware from "./remoconMiddleware";
import setupGraphQL from "./graphql";

import * as AudioSystem from "../common/AudioSystem.ts";

const inputDevices = AudioSystem.inputDevices();
const mic = new AudioSystem.InputDevice(inputDevices[0]);
setInterval(() => {
  const pitch = mic.getPitch();
  if (pitch.confidence > 0.8 && pitch.frequency !== 0) {
    console.log(`Pitch: ${pitch.frequency}`); // tslint:disable-line:no-console
  }
}, 25);

const expressApp = express();
expressApp.use(remoconMiddleware());
setupGraphQL(expressApp);
expressApp.listen(8080);

let mainWindow: BrowserWindow | null;

function createWindow() {
  mainWindow = new BrowserWindow({
    frame: isDev,
    fullscreen: !isDev,
    webPreferences: {
      enableRemoteModule: true,
      nodeIntegration: true,
    },
  });
  mainWindow.loadURL(
    isDev
      ? "http://localhost:3000/renderer/"
      : `file://${path.join(__dirname, "..", "renderer", "index.html")}`
  );
  mainWindow.on("closed", () => (mainWindow = null));
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});
